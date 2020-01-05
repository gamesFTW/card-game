import * as Router from 'koa-router';
import { EntityId } from '../infr/Entity';
import { PlayCardAsManaUseCase } from '../app/player/PlayCardAsManaUseCase';
import { Point } from '../infr/Point';
import { PlayCardUseCase } from '../app/player/PlayCardUseCase';
import { MoveCardUseCase } from '../app/player/MoveCardUseCase';
import { AbilitiesParams, AttackCardUseCase } from '../app/player/AttackCardUseCase';
import { HealCardUseCase } from '../app/player/HealCardUseCase';
import { UseManaAbilityUseCase } from '../app/player/UseManaAbilityUseCase';
import { ToAimUseCase } from '../app/player/ToAimUseCase';
import { UseCase } from '../infr/UseCase';

const playerController = new Router();

playerController.post('/playCardAsMana', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.request.body.playerId as EntityId;
  let cardId = ctx.request.body.cardId as EntityId;

  let useCase = new PlayCardAsManaUseCase({gameId, playerId, cardId});
  await useCase.execute();

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

  let useCase = new PlayCardUseCase({gameId, playerId, cardId, position});
  await useCase.execute();

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

  let useCase = new MoveCardUseCase({gameId, playerId, cardId, position});
  await useCase.execute();

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

  let attackCard = new AttackCardUseCase({gameId, attackerPlayerId, attackerCardId, attackedCardId, isRangeAttack, abilitiesParams});
  await attackCard.execute();

  ctx.body = `Ok`;
});

playerController.post('/moveAndAttackCard', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let attackerPlayerId = ctx.request.body.playerId as EntityId;
  let attackerCardId = ctx.request.body.attackerCardId as EntityId;
  let attackedCardId = ctx.request.body.attackedCardId as EntityId;
  let isRangeAttack = ctx.request.body.isRangeAttack as boolean;
  let abilitiesParams = ctx.request.body.abilitiesParams as AbilitiesParams;

  let attackCard = new MoveCardUseCase({gameId, playerId: attackerPlayerId, cardId: attackerCardId, targetCardId: attackedCardId});
  let moveCard = new AttackCardUseCase({gameId, attackerPlayerId, attackerCardId, attackedCardId, isRangeAttack, abilitiesParams});

  await UseCase.executeSequentially(gameId, [attackCard, moveCard]);

  ctx.body = `Ok`;
});

playerController.post('/healCard', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.request.body.playerId as EntityId;
  let healerCardId = ctx.request.body.healerCardId as EntityId;
  let healedCardId = ctx.request.body.healedCardId as EntityId;

  let healCard = new HealCardUseCase({gameId, playerId, healerCardId, healedCardId});
  await healCard.execute();

  ctx.body = `Ok`;
});

playerController.post('/useManaAbility', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.request.body.playerId as EntityId;
  let cardId = ctx.request.body.cardId as EntityId;

  let useCase = new UseManaAbilityUseCase({gameId, playerId, cardId});
  await useCase.execute();

  ctx.body = `Ok`;
});

playerController.post('/toAim', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = ctx.request.body.playerId as EntityId;
  let cardId = ctx.request.body.cardId as EntityId;

  let useCase = new ToAimUseCase({gameId, playerId, cardId});
  await useCase.execute();

  ctx.body = `Ok`;
});

export {playerController};
