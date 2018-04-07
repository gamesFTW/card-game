import * as Router from 'koa-router';
import { Game } from '../../domain/game/Game';
import * as gameEvents from '../../domain/game/GameEvents';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { GameCreation } from './GameCreation';

const gameController = new Router();

gameController.get('/createGame', async (ctx) => {
  // Temporary data
  ctx.query.player1Cards = [
    {name: 'Orc', maxHp: 10, damage: 2},
    {name: 'Orc Warlord', maxHp: 14, damage: 3}
  ];
  ctx.query.player2Cards = [{name: 'Elf', maxHp: 6, damage: 1}];

  let player1CardsData = ctx.query.player1Cards;
  let player2CardsData = ctx.query.player2Cards;

  let gameId = await GameCreation.execute(player1CardsData, player2CardsData);

  ctx.body = `Game created. id: ${gameId}.`;
});

gameController.get('/getGame', async (ctx) => {
  let id = ctx.query.id as EntityId;
  let game = await Repository.get<Game>(id, Game, gameEvents);

  ctx.body = `Game id: ${game.id}.`;
});

export {gameController};
