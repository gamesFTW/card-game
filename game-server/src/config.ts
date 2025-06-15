const DOCKER_HOST = process.env['DOCKER_HOST_IP'] || 'localhost'; // Remove it

const MONGO_URL = process.env.MONGO_URL || 'localhost';

export default {
  MONGO_URL: `${MONGO_URL}`,
  MONGO_PORT: 27017,
  DEV: true,
  IN_MEMORY_STORAGE: false,
  GAME_URL: 'http://localhost:3000/',
};
