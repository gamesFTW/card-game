import * as Router from 'koa-router';
import { EntityId } from '../../infr/Entity';
import { Point } from '../../infr/Point';
import { AttackCardUseCase } from './AttackCardUseCase';
import { PlayCardAsManaUseCase } from './PlayCardAsManaUseCase';
import { PlayCardUseCase } from './PlayCardUseCase';
import { MoveCardUseCase } from './MoveCardUseCase';

const playerController = new Router();

playerController.post('/playCardAsMana', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.request.body.playerId as EntityId;
  let cardId = ctx.request.body.cardId as EntityId;

  let useCase = new PlayCardAsManaUseCase();
  await useCase.execute({gameId, playerId, cardId});

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

  let useCase = new PlayCardUseCase();
  await useCase.execute({gameId, playerId, cardId, position});

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

  let useCase = new MoveCardUseCase();
  await useCase.execute({gameId, playerId, cardId, position});

  ctx.body = `Ok`;
});

playerController.post('/attackCard', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let attackerPlayerId = ctx.request.body.playerId as EntityId;
  let attackerCardId = ctx.request.body.attackerCardId as EntityId;
  let attackedCardId = ctx.request.body.attackedCardId as EntityId;
  let isRangeAttack = ctx.request.body.isRangeAttack as boolean;

  let attackCard = new AttackCardUseCase();
  await attackCard.execute({gameId, attackerPlayerId, attackerCardId, attackedCardId, isRangeAttack});

  ctx.body = `Ok`;
});

export {playerController};
