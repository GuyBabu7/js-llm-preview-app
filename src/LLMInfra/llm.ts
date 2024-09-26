import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
} from '@langchain/core/prompts';
import { AIMessage } from '@langchain/core/messages';
import { addValueToInputTokensHistogram, addValueToOutputTokensHistogram } from '/utils/metrics';
import { LLMModel } from '/LLMInfra/constants';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import { ChainValues } from '@langchain/core/dist/utils/types';
import { AgentExecutor, createXmlAgent } from 'langchain/agents';

const logger = require('@ww/gql-base-service').logger.withContext(__filename);

const BEDROCK_REGION = 'us-west-2';

const MODEL_TEMPERATURE = 0;

function createBebrockModel(modelName: LLMModel) {
  return new BedrockChat({
    model: modelName,
    region: BEDROCK_REGION,
    temperature: MODEL_TEMPERATURE,
  });
}

const BedrockChatObjectMap = {
  [LLMModel.CLAUDE_3_HAIKU_MODEL]: createBebrockModel(LLMModel.CLAUDE_3_HAIKU_MODEL),
  [LLMModel.CLAUDE_3_5_SONNET_MODEL]: createBebrockModel(LLMModel.CLAUDE_3_5_SONNET_MODEL),
};

const duckDuckGoSearchTool = new DuckDuckGoSearch({ searchOptions: { safeSearch: 0 } });

export async function invokeChat({
  modelName,
  systemPrompt,
  input,
  taskName,
}: {
  modelName: LLMModel;
  systemPrompt: string;
  input: string;
  taskName: string;
}): Promise<AIMessage> {
  preventRunningInTests();

  const humanTemplate = '{text}';

  const chatPrompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['human', humanTemplate],
  ]);

  const formattedChatPrompt = await chatPrompt.formatMessages({
    text: input,
  });

  const model = BedrockChatObjectMap[modelName];

  const startTime = performance.now();

  logger
    .withTags([`inputLength=${input.length}`, `measuredInputTokens=${input.length / 4}`])
    .debug(`Calling model invoke function`);

  const res: AIMessage = await model.invoke(formattedChatPrompt);

  logger
    .withTags([
      `duration=${performance.now() - startTime}`,
      `usage=${JSON.stringify(res.response_metadata.usage)}`,
    ])
    .debug(`Finished model invoke`);

  addValueToInputTokensHistogram({ taskName, value: res.response_metadata.usage.input_tokens });
  addValueToOutputTokensHistogram({ taskName, value: res.response_metadata.usage.output_tokens });

  return res;
}

function createXMLAgentPrompt({
  xmlSystemPrompt,
  additionalInputVariables = [],
}: {
  xmlSystemPrompt: string;
  additionalInputVariables: string[];
}): ChatPromptTemplate {
  const inputVariables = ['input', 'tools', 'agent_scratchpad', ...additionalInputVariables];

  const promptTemplate = new PromptTemplate({ template: xmlSystemPrompt, inputVariables });

  const humanMessagePrompt = new HumanMessagePromptTemplate(promptTemplate);

  const prompt = ChatPromptTemplate.fromMessages([humanMessagePrompt]);

  return prompt;
}

export async function invokeBedrockAgentWithSearchTool({
  modelName,
  xmlSystemPrompt,
  input,
  jsonAnswerFormat,
  taskName,
}: {
  modelName: LLMModel;
  xmlSystemPrompt: string;
  input: string;
  jsonAnswerFormat: string;
  taskName: string;
}): Promise<ChainValues> {
  preventRunningInTests();
  const model = BedrockChatObjectMap[modelName];
  const tools = [duckDuckGoSearchTool];
  const prompt = createXMLAgentPrompt({
    xmlSystemPrompt,
    additionalInputVariables: ['final_answer_format'],
  });

  const agent = await createXmlAgent({ llm: model, tools, prompt });
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    returnIntermediateSteps: true,
  });
  const startTime = performance.now();

  logger.debug(`Calling agent invoke function ${taskName}`);

  const res = await agentExecutor.invoke({ input, final_answer_format: jsonAnswerFormat });

  logger.debug(`Finished agent invoke, took ${performance.now() - startTime} milliseconds`);

  // TODO: Add metrics for input and output tokens. currently not available in the response

  return res;
}

function preventRunningInTests() {
  if (process.env.NODE_ENV === 'test' && process.env.IS_INTEGRATION_TEST !== 'true') {
    throw new Error('Cannot call LLM function in test environment (outside of integration tests)');
  }
}
