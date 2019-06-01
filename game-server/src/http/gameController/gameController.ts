import * as Router from 'koa-router';

import { Game } from '../../domain/game/Game';
import { EntityId } from '../../infr/Entity';
import { PlayerCreationData } from '../../domain/player/Player';

import { godOfSockets } from '../../infr/GodOfSockets';
import { EndTurnUseCase } from '../../app/game/EndTurnUseCase';
import axios from 'axios';
import config from '../../config';
import { Repository } from '../../infr/repositories/Repository';
import { getGameAction } from './getGameAction/getGameAction';
import { lobbyService } from '../../app/lobbyService';

const gameController = new Router();

gameController.post('/createGame', async (ctx) => {
  // Temporary data test data
  // ctx.request.body.playerA = startingCardsFixture.playerA;
  // ctx.request.body.playerB = startingCardsFixture.playerB;

  let playerAData = ctx.request.body.playerA as PlayerCreationData;
  let playerBData = ctx.request.body.playerB as PlayerCreationData;

  let game = new Game();
  let {player1, player2, player1Cards, player2Cards, board, areas} = game.create(playerAData, playerBData);

  let repository = new Repository();
  await repository.save([player1Cards, player1, player2Cards, player2, board, game, areas]);

  godOfSockets.registerNamespace(game.id);

  ctx.body = {gameId: game.id};
});

gameController.get('/getGame', getGameAction);

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
