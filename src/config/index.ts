import { merge } from 'lodash';
import all from './env/all';

function safeRequire(path) {
  try {
    return require(path).default;
  } catch (e) {
    return undefined;
  }
}

const config = merge(all, safeRequire(`./env/${process.env.NODE_ENV ?? 'development'}`));
export default config;
