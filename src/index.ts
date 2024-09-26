import { init, createTS } from '@ww/gql-base-service';
import config from './config';

export default (async () => {
  await init(config);
  const schemas = require('./schema').default;

  return createTS(schemas, config);
})();
