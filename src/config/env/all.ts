export default {
  appName: 'llm-gql-service',
  serverConfig: {
    bodyParserConfig: {
      limit: '10mb',
    },
  },
  cacheTTL: {
    vesselSummary: 60 * 60 * 24 * 7, // 1 week,
    earlyDetectionSummary: 60 * 60 * 24 * 2, // 2 days
  },
  db: {
    redis: {
      host: 'redis-staging.windward.com',
      db: 1,
    },
  },
};
