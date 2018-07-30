import * as Router from 'koa-router';
import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { formatEventsForClient } from '../../infr/Event';
import { Player } from '../../domain/player/Player';
import { Card } from '../../domain/card/Card';
import { Point } from '../../infr/Point';
import { Field } from '../../domain/field/Field';
import { AttackService } from '../../domain/AttackService/AttackService';

import { wsUserRegistry } from '../../infr/WSUserRegistry';

const playerController = new Router();

playerController.post('/playCardAsManna', async (ctx) => {
  console.log(ctx.request.body);

  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.request.body.playerId as EntityId;
  let cardId = ctx.request.body.cardId as EntityId;

  let game = await Repository.get<Game>(gameId, Game);
  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);

  player.playCardAsManna(card);

  let entities = [player, card];
  await Repository.save(entities);

  // Send data to client
  wsUserRegistry.sendEventsInGame(game.id, player.id, formatEventsForClient(entities));

  ctx.body = `Ok`;
});

playerController.post('/playCard', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.request.body.playerId as EntityId;
  let cardId = ctx.request.body.cardId as EntityId;
  let x = ctx.request.body.x;
  let y = ctx.request.body.y;

  let position = new Point(x, y);

  let game = await Repository.get<Game>(gameId, Game);
  let field = await Repository.get<Field>(game.fieldId, Field);
  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);
  let playerMannaPoolCards = await Repository.getMany <Card>(player.mannaPool, Card);

  player.playCard(card, playerMannaPoolCards, position, field);

  let entities = [player, card, field, playerMannaPoolCards];
  await Repository.save(entities);

  // Send data to client
  wsUserRegistry.sendEventsInGame(game.id, player.id, formatEventsForClient(entities));

  ctx.body = `Ok`;
});

playerController.post('/moveCard', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.request.body.playerId as EntityId;
  let cardId = ctx.request.body.cardId as EntityId;
  let x = ctx.request.body.x;
  let y = ctx.request.body.y;

  let position = new Point(x, y);

  let game = await Repository.get<Game>(gameId, Game);
  let field = await Repository.get<Field>(game.fieldId, Field);
  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);

  player.moveCard(card, position, field);

  let entities = [player, card, field];
  await Repository.save(entities);

  // Send data to client
  wsUserRegistry.sendEventsInGame(game.id, player.id, formatEventsForClient(entities));
  ctx.body = `Ok`;
});

playerController.post('/attackCard', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let attackerPlayerId = ctx.request.body.playerId as EntityId;

  let attackerCardId = ctx.request.body.attackerCardId as EntityId;
  let attackedCardId = ctx.request.body.attackedCardId as EntityId;

  let game = await Repository.get<Game>(gameId, Game);
  let field = await Repository.get<Field>(game.fieldId, Field);
  let attackerPlayer = await Repository.get<Player>(attackerPlayerId, Player);
  let attackedPlayerId = game.getPlayerIdWhichIsOpponentFor(attackerPlayerId);
  let attackedPlayer = await Repository.get<Player>(attackedPlayerId, Player);
  let attackerCard = await Repository.get<Card>(attackerCardId, Card);
  let attackedCard = await Repository.get<Card>(attackedCardId, Card);

  AttackService.attackUnit(attackerCard, attackedCard, attackerPlayer, attackedPlayer, field);

  let entities = [attackedPlayer, attackerPlayer, attackedCard, attackerCard];
  await Repository.save(entities);

  // Send data to client
  wsUserRegistry.sendEventsInGame(game.id, attackedPlayer.id, formatEventsForClient(entities));
  ctx.body = `Ok`;
});

export {playerController};
