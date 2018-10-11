const DOCKER_HOST = process.env['DOCKER_HOST_IP'] || '192.168.99.100';

export default {
  RABBIT_MQ_URL: `amqp://${DOCKER_HOST}:5672`,
  REDIS_URL: `redis://${DOCKER_HOST}:6379`,
  MONGO_URL: `${DOCKER_HOST}`,
  MONGO_PORT: 27017,
  DEV: true,
  MAIN_EXCHANGE: 'main'
};
