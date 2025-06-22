import { Router } from 'express';

import { Game } from '../../domain/game/Game';
import { EntityId } from '../../infr/Entity';
import { PlayerCreationData } from '../../domain/player/Player';

import { godOfSockets } from '../../infr/GodOfSockets';
import { EndTurnUseCase } from '../../app/game/EndTurnUseCase';
import axios from 'axios';
import config from '../../../config';
import { Repository } from '../../infr/repositories/Repository';
import { getGameAction } from './getGameAction/getGameAction';
import { lobbyService } from '../../app/lobbyService';
import { ObjectId } from 'mongodb';

const gameController = Router();

gameController.post('/createGame', async (request, response) => {
  // Temporary data test data
  // ctx.request.body.playerA = startingCardsFixture.playerA;
  // ctx.request.body.playerB = startingCardsFixture.playerB;

  let playerAData = request.body.playerA as PlayerCreationData;
  let playerBData = request.body.playerB as PlayerCreationData;

  let game = new Game();
  const gameId = new ObjectId();

  await Repository.gamesCollection.insertOne({
    _id: gameId,
    type: 'solo',
    date: (new Date()).toString(),
    gameServerId: gameId.toString(),
    started: false,
    deckId1: playerAData.deckId,
    deckId2: playerBData.deckId,
    deckId3: null,
    deckId4: null,
    entities: {},
  });

  let {player1, player2, player1Cards, player2Cards, board, areas} = game.create(gameId.toString(), playerAData, playerBData);

  let repository = new Repository(game.id);
  
  await repository.save([player1Cards, player1, player2Cards, player2, board, game, areas]);

  //godOfSockets.registerNamespace(game.id);

  response.send({gameId: game.id});
});

gameController.get('/getGame', getGameAction);

gameController.post('/endTurn', async (request, response) => {
  let gameId = request.body.gameId as EntityId;
  // TODO: playerId нужно доставать из сессии
  let endingTurnPlayerId = request.body.playerId as EntityId;

  let endTurnUseCase = new EndTurnUseCase({gameId, endingTurnPlayerId});
  await endTurnUseCase.execute();

  response.send(`Ok`);
});

gameController.get('/getLastGame', async (request, response) => {
  const games = await lobbyService.getAllGames();
  let lastGameId = games[games.length - 1].gameServerId;

  const lastGame = await axios.get(config.GAME_URL + `getGame?gameId=${lastGameId}`);

  response.send(lastGame);
});

export {gameController};
