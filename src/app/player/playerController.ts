import * as Router from 'koa-router';
import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { Player } from '../../domain/player/Player';
import { Card } from '../../domain/card/Card';
import { Point } from '../../infr/Point';
import { Field } from '../../domain/field/Field';

const playerController = new Router();

playerController.post('/playCardAsManna', async (ctx) => {
  // TODO: его нужно доставать из сессии
  let playerId = ctx.query.playerId as EntityId;
  let cardId = ctx.query.cardId as EntityId;

  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);

  player.playCardAsManna(card);

  await Repository.save(player);
  await Repository.save(card);

  ctx.body = `Ok`;
});

playerController.post('/playCard', async (ctx) => {
  let gameId = ctx.query.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.query.playerId as EntityId;
  let cardId = ctx.query.cardId as EntityId;
  let x = ctx.query.x;
  let y = ctx.query.y;

  let position = new Point(x, y);

  let game = await Repository.get<Game>(gameId, Game);
  let field = await Repository.get<Field>(game.fieldId, Field);
  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);
  let playerMannaPoolCards = await Repository.getMany <Card>(player.mannaPool, Card);

  player.playCard(card, playerMannaPoolCards, position, field);

  await Repository.save(player);
  await Repository.save(card);
  await Repository.save(field);
  await Repository.save(playerMannaPoolCards);

  ctx.body = `Ok`;
});

playerController.post('/moveCreature', async (ctx) => {
  let gameId = ctx.query.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.query.playerId as EntityId;
  let cardId = ctx.query.cardId as EntityId;
  let x = ctx.query.x;
  let y = ctx.query.y;

  let position = new Point(x, y);

  let game = await Repository.get<Game>(gameId, Game);
  let field = await Repository.get<Field>(game.fieldId, Field);
  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);

  player.moveCreature(card, position, field);

  await Repository.save(player);
  await Repository.save(card);
  await Repository.save(field);

  ctx.body = `Ok`;
});

export {playerController};
