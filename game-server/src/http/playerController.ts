import * as Router from 'koa-router';
import { EntityId } from '../infr/Entity';
import { PlayCardAsManaUseCase } from '../app/player/PlayCardAsManaUseCase';
import { Point } from '../infr/Point';
import { PlayCardUseCase } from '../app/player/PlayCardUseCase';
import { MoveCardUseCase } from '../app/player/MoveCardUseCase';
import { AbilitiesParams, AttackCardUseCase } from '../app/player/AttackCardUseCase';

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
  let x = Number(ctx.request.body.x);
  let y = Number(ctx.request.body.y);

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
  let x = Number(ctx.request.body.x);
  let y = Number(ctx.request.body.y);

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
  let abilitiesParams = ctx.request.body.abilitiesParams as AbilitiesParams;

  let attackCard = new AttackCardUseCase();
  await attackCard.execute({gameId, attackerPlayerId, attackerCardId, attackedCardId, isRangeAttack, abilitiesParams});

  ctx.body = `Ok`;
});

export {playerController};
