import * as Router from 'koa-router';

import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { formatEventsForClient } from '../../infr/Event';
import {Player, PlayerCreationData} from '../../domain/player/Player';
import { Card, CardCreationData } from '../../domain/card/Card';
import { mapPlayer } from './mapPlayer';
import { Board } from '../../domain/board/Board';
import { mapPlayerPretty } from './mapPlayerPretty';

import { godOfSockets } from '../../infr/GodOfSockets';
import { startingCardsFixture } from './startingCardsFixture';
import {EndTurnUseCase} from './EndTurnUseCase';
import { lobbyService } from '../lobbyService';
import axios from 'axios';
import config from '../../config';

const gameController = new Router();

gameController.post('/createGame', async (ctx) => {
  // Temporary data
  ctx.request.body.playerA = startingCardsFixture.playerA;
  ctx.request.body.playerB = startingCardsFixture.playerB;

  let playerAData = ctx.request.body.playerA as PlayerCreationData;
  let playerBData = ctx.request.body.playerB as PlayerCreationData;

  let game = new Game();
  let {player1, player2, player1Cards, player2Cards, board} = game.create(playerAData, playerBData);

  await Repository.save([player1Cards, player1, player2Cards, player2, board, game]);

  // godOfSockets.registerNamespace(game.id);

  ctx.body = {gameId: game.id};
});

gameController.get('/getGame', async (ctx) => {
  let gameId = ctx.query.gameId as EntityId;
  let isPretty = ctx.query.isPretty as boolean;

  let game = await Repository.get<Game>(gameId, Game);

  let board = await Repository.get<Board>(game.boardId, Board);

  let player1 = await Repository.get<Player>(game.player1Id, Player);
  let player2 = await Repository.get<Player>(game.player2Id, Player);

  if (isPretty) {
    let player1Response = await mapPlayerPretty(player1, board);
    let player2Response = await mapPlayerPretty(player2, board);

    ctx.body = `Game: ${JSON.stringify(game, undefined, 2)}
Player1: ${player1Response}
Player2: ${player2Response}`;
  } else {
    let player1Response = await mapPlayer(player1, board);
    let player2Response = await mapPlayer(player2, board);

    ctx.body = {
      game: Object(game).state,
      player1: player1Response,
      player2: player2Response
    };
  }
});

gameController.post('/endTurn', async (ctx) => {
  let gameId = ctx.request.body.gameId as EntityId;
  // TODO: playerId нужно доставать из сессии
  let endingTurnPlayerId = ctx.request.body.playerId as EntityId;

  let endTurnUseCase = new EndTurnUseCase();
  await endTurnUseCase.execute({gameId, endingTurnPlayerId});

  ctx.body = `Ok`;
});

gameController.get('/getLastGame', async (ctx) => {
  let games = await lobbyService.getAllGames();
  let lastGameId = games[games.length - 1];

  let response = await axios.get(config.GAME_URL + `getGame?gameId=${lastGameId}`);

  ctx.body = response.data;
});

export {gameController};
