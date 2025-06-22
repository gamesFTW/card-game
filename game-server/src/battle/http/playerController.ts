import { Router } from 'express';
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

const playerController = Router();

playerController.post('/playCardAsMana', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = request.body.playerId as EntityId;
  let cardId = request.body.cardId as EntityId;

  let useCase = new PlayCardAsManaUseCase({gameId, playerId, cardId});
  await useCase.execute();

  response.send(`Ok`);
});

playerController.post('/playCard', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = request.body.playerId as EntityId;
  let cardId = request.body.cardId as EntityId;
  let x = Number(request.body.x);
  let y = Number(request.body.y);

  let position = new Point(x, y);

  let useCase = new PlayCardUseCase({gameId, playerId, cardId, position});
  await useCase.execute();

  response.send(`Ok`);
});

playerController.post('/moveCard', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = request.body.playerId as EntityId;
  let cardId = request.body.cardId as EntityId;
  let x = Number(request.body.x);
  let y = Number(request.body.y);

  let position = new Point(x, y);

  let useCase = new MoveCardUseCase({gameId, playerId, cardId, position});
  await useCase.execute();

  response.send(`Ok`);
});

playerController.post('/attackCard', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let attackerPlayerId = request.body.playerId as EntityId;
  let attackerCardId = request.body.attackerCardId as EntityId;
  let attackedCardId = request.body.attackedCardId as EntityId;
  let isRangeAttack = request.body.isRangeAttack as boolean;
  let abilitiesParams = request.body.abilitiesParams as AbilitiesParams;

  let attackCard = new AttackCardUseCase({gameId, attackerPlayerId, attackerCardId, attackedCardId, isRangeAttack, abilitiesParams});
  await attackCard.execute();

  response.send(`Ok`);
});

playerController.post('/moveAndAttackCard', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let attackerPlayerId = request.body.playerId as EntityId;
  let attackerCardId = request.body.attackerCardId as EntityId;
  let attackedCardId = request.body.attackedCardId as EntityId;
  let isRangeAttack = request.body.isRangeAttack as boolean;
  let abilitiesParams = request.body.abilitiesParams as AbilitiesParams;

  let attackCard = new MoveCardUseCase({gameId, playerId: attackerPlayerId, cardId: attackerCardId, targetCardId: attackedCardId});
  let moveCard = new AttackCardUseCase({gameId, attackerPlayerId, attackerCardId, attackedCardId, isRangeAttack, abilitiesParams});

  await UseCase.executeSequentially(gameId, [attackCard, moveCard]);

  response.send(`Ok`);
});

playerController.post('/healCard', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = request.body.playerId as EntityId;
  let healerCardId = request.body.healerCardId as EntityId;
  let healedCardId = request.body.healedCardId as EntityId;

  let healCard = new HealCardUseCase({gameId, playerId, healerCardId, healedCardId});
  await healCard.execute();

  response.send(`Ok`);
});

playerController.post('/useManaAbility', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = request.body.playerId as EntityId;
  let cardId = request.body.cardId as EntityId;

  let useCase = new UseManaAbilityUseCase({gameId, playerId, cardId});
  await useCase.execute();

  response.send(`Ok`);
});

playerController.post('/toAim', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let playerId = request.body.playerId as EntityId;
  let cardId = request.body.cardId as EntityId;

  let useCase = new ToAimUseCase({gameId, playerId, cardId});
  await useCase.execute();

  response.send(`Ok`);
});

export {playerController};
