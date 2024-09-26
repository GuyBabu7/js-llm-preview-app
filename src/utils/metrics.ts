import * as prometheus from '@ww/gql-base-service/lib/lib/prometheus';

const LLM_LABEL = 'LLM';

const inputTokensRequest = new prometheus.Histogram({
  name: 'input_tokens_request',
  help: 'count of input tokens in request',
  labelNames: [LLM_LABEL],
  buckets: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000], // Buckets for input tokens count in request
});

const outputTokensRequest = new prometheus.Histogram({
  name: 'output_tokens_request',
  help: 'count of output tokens in request',
  labelNames: [LLM_LABEL],
  buckets: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000], // Buckets for output tokens count in request
});

export function addValueToInputTokensHistogram({
  taskName,
  value,
}: {
  taskName: string;
  value: number;
}) {
  inputTokensRequest.labels(taskName).observe(value);
}

export function addValueToOutputTokensHistogram({
  taskName,
  value,
}: {
  taskName: string;
  value: number;
}) {
  outputTokensRequest.labels(taskName).observe(value);
}
