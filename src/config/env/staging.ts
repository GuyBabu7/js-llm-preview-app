import { merge } from 'lodash';
import production from './production';

export default merge(production, {
  db: {
    redis: {
      host: 'redis-staging.windward.com',
      db: 11,
    },
  },
});
