const DOCKER_HOST = process.env['DOCKER_HOST_IP'] || 'localhost'; // Remove it

const MONGO_URL = process.env.MONGO_URL || 'localhost';

export default {
  MONGO_URL: `${MONGO_URL}`,
  MONGO_PORT: 27017,
  DEV: true,
  IN_MEMORY_STORAGE: false,
  // Remove it
  RABBIT_MQ_URL: `amqp://${DOCKER_HOST}:5672`,
  REDIS_URL: `redis://${DOCKER_HOST}:6379`,
  MAIN_EXCHANGE: 'main',
  GAME_URL: 'http://localhost:3000/',
  LOBBY_URL: 'http://localhost:3001/',
  METEOR_URL: 'http://localhost:4000/',
};
