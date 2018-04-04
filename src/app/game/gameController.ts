import * as Router from 'koa-router';
import { Player } from '../../domain/players/Player';
import { Game } from '../../domain/game/Game';
import * as gameEvents from '../../domain/game/GameEvents';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';

const gameController = new Router();

gameController.get('/createGame', async (ctx) => {
  let player1 = new Player();
  player1.create();

  let player2 = new Player();
  player2.create();

  let game = new Game();
  game.create(player1, player2);

  try {
    await Repository.save(player1);
    await Repository.save(player2);
    await Repository.save(game);
  } catch (error) {
    // Всё сохранение нужно завернуть в транзакцию и тут её нужно откатить.
    console.error('Achtung!!!');
  }

  ctx.body = `Game created. id: ${game.id}.`;
});

gameController.get('/getGame', async (ctx) => {
  let id = ctx.query.id as EntityId;
  let game = await Repository.get(id, Game, gameEvents);

  ctx.body = `Game id: ${game.id}.`;
});

export {gameController};
