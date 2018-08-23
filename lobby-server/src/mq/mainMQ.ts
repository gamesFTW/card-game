import * as Queue from 'bull';
import config from '../../../game-server/src/config';
import { GameModel, GameStatus } from '../db/db';

let mainMQ;

let registerMQ = () => {
  mainMQ = new Queue(config.MAIN_MQ, config.REDIS_URL);

  mainMQ.process(async (message: any): Promise<void> => {
    const game = new GameModel({ gameId: message.data.id, status: GameStatus.NEW });
    await game.save();

    return Promise.resolve();
  });
};

export { registerMQ, mainMQ };
