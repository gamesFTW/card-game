import * as Queue from 'bull';
import config from '../../config';

let mainMQ = new Queue(config.MAIN_MQ, config.REDIS_URL);

export { mainMQ };
