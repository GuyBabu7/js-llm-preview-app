/* eslint-disable class-methods-use-this */
import { ResolvedUser } from '@ww/gql-schema-types';
import { ForbiddenError } from '@ww/gql-base-service/lib/apollo-server';
import { invokeChat } from '/LLMInfra/llm';
import { LLMModel } from '/LLMInfra/constants';
import { convertJsonToYaml } from '/utils/yaml';
import { writeFile } from 'fs/promises';
import { log } from 'console';

const logger = require('@ww/gql-base-service').logger.withContext(__filename);

export class SummaryGenerator {
  protected readonly user: ResolvedUser;

  private readonly requiredFeatureFlag: string;

  private readonly systemPrompt: string;

  private readonly summaryLLMModel: LLMModel;

  constructor({
    user,
    requiredFeatureFlag,
    systemPrompt,
    summaryLLMModel,
  }: {
    user: ResolvedUser;
    requiredFeatureFlag: string;
    systemPrompt: string;
    summaryLLMModel: LLMModel;
  }) {
    this.user = user;
    this.requiredFeatureFlag = requiredFeatureFlag;
    this.systemPrompt = systemPrompt;
    this.summaryLLMModel = summaryLLMModel;
  }

  private async generateEnglishSummary({ summaryInput }: { summaryInput: Object }) {
    const input = convertJsonToYaml(this.processSummaryInput(summaryInput));

    try {
      writeFile(`processSummaryInput/vessel_yaml.txt`, input);
    } catch (err) {
      logger.debug(err);
    }

    const { content } = await invokeChat({
      taskName: 'VESSEL_SUMMARY',
      modelName: this.summaryLLMModel,
      systemPrompt: this.systemPrompt,
      input,
    });

    return content;
  }

  async generateSummary() {
    if (!this.user.hasFeatureFlag(this.requiredFeatureFlag)) {
      throw new ForbiddenError(`Not authorized`);
    }

    const summaryInput = await this.fetchSummaryInput();

    if (summaryInput?.vesselByIMO === null) {
      return { summary: 'Error' };
    }

    const summary = await this.generateEnglishSummary({
      summaryInput,
    });

    return { summary };
  }

  protected async fetchSummaryInput(): Promise<Object> {
    throw new Error("Method 'fetchSummaryInput' must be overridden.");
  }

  protected processSummaryInput(summaryInput: Object): Object {
    return summaryInput;
  }
}
