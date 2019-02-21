import * as Router from 'koa-router';
import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { formatEventsForClient } from '../../infr/Event';
import { Player } from '../../domain/player/Player';
import { Card } from '../../domain/card/Card';
import { Point } from '../../infr/Point';
import { Board } from '../../domain/board/Board';
import { godOfSockets } from '../../infr/GodOfSockets';
import { AttackCardUseCase } from './AttackCardUseCase';
import {PlayCardAsManaUseCase} from './PlayCardAsManaUseCase';

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

  let game = await Repository.get<Game>(gameId, Game);
  let board = await Repository.get<Board>(game.boardId, Board);
  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);
  let playerManaPoolCards = await Repository.getMany <Card>(player.manaPool, Card);

  player.playCard(card, playerManaPoolCards, position, board);

  let entities = [player, card, board, playerManaPoolCards];
  await Repository.save(entities);

  // Send data to client
  godOfSockets.sendEventsInGame(game.id, player.id, formatEventsForClient(entities));

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
  let board = await Repository.get<Board>(game.boardId, Board);
  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);

  player.moveCard(card, position, board);

  let entities = [player, card, board];
  await Repository.save(entities);

  // Send data to client
  godOfSockets.sendEventsInGame(game.id, player.id, formatEventsForClient(entities));
  ctx.body = `Ok`;
});

playerController.post('/attackCard', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: его нужно доставать из сессии
  let attackerPlayerId = ctx.request.body.playerId as EntityId;

  let attackerCardId = ctx.request.body.attackerCardId as EntityId;
  let attackedCardId = ctx.request.body.attackedCardId as EntityId;

  let attackCard = new AttackCardUseCase();
  await attackCard.execute(gameId, attackerPlayerId, attackerCardId, attackedCardId);

  ctx.body = `Ok`;
});

export {playerController};
