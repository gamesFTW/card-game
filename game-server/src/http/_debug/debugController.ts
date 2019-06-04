import * as Router from 'koa-router';
import axios from 'axios';
import opn = require('opn');
import config from '../../config';
import { startingCardsFixture } from './startingCardsFixture';

const debugController = new Router();

debugController.post('/createGameForML', async (ctx) => {
  let response = await axios.post(config.GAME_URL + 'createGame', {
    playerA: startingCardsFixture.playerA,
    playerB: startingCardsFixture.playerB
  });
  let gameId = response.data.gameId;

  response = await axios.get(config.GAME_URL + `getGame?gameId=${gameId}`);

  axios.post(config.GAME_URL + `playDebugGameWithDelay`, { gameId }).then(() => {
    console.info('Debug game creation is finished');
  }).catch(e => {
    console.error(e.message);
  });

  ctx.body = gameId;
  // ctx.body = `http://localhost:8080/?gameId=${gameId}&playerId=${player1.id}`;
  // opn(ctx.body);
});

debugController.post('/playDebugGameWithDelay', async (ctx) => {
  let gameId = ctx.request.body.gameId as string;

  let response = await axios.get(config.GAME_URL + `getGame?gameId=${gameId}`);
  let player1 = response.data.player1;
  let player2 = response.data.player2;

  await playCard(gameId, player1.id, player1.hand[0].id, 6, 1);
  await playCard(gameId, player1.id, player1.hand[1].id, 4, 1);
  await endTurn(gameId, player1.id);

  await playCard(gameId, player2.id, player2.hand[0].id, 6, 9);
  await playCard(gameId, player2.id, player2.hand[1].id, 4, 9);
  await endTurn(gameId, player2.id);

  ctx.body = {gameId};
});

function delay (duration: number): Promise<void> {
  return new Promise(function (resolve, reject): void {
    setTimeout(function (): void {
      resolve();
    }, duration);
  });
}

async function playCardAsMana (gameId: string, playerId: string, cardId: string): Promise<void> {
  await axios.post(
    config.GAME_URL + 'playCardAsMana',
    {playerId, cardId, gameId}
  );
}

async function playCard (gameId: string, playerId: string, cardId: string, x: number, y: number): Promise<void> {
  await axios.post(
    config.GAME_URL + 'playCard',
    {gameId, playerId, cardId, x, y}
  );
}

async function attackCard (
    gameId: string, playerId: string, attackerCardId: string, attackedCardId: string
  ): Promise<void> {
  await axios.post(
    config.GAME_URL + 'attackCard',
    {gameId, playerId, attackerCardId, attackedCardId}
  );
}

async function endTurn (gameId: string, playerId: string): Promise<void> {
  await axios.post(config.GAME_URL + 'endTurn',{gameId, playerId});
}

export {debugController};
