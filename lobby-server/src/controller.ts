import * as Router from 'koa-router';
import { GameModel } from './db/db';

const controller = new Router();

controller.get('/games', async (ctx) => {
  const games = await GameModel.find({});
  let gameIds = games.map(g => g.gameId);

  ctx.body = {games: gameIds};
});

export {controller};
