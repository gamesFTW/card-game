import * as Router from 'koa-router';
import axios from 'axios';
import opn = require('opn');

const debugController = new Router();

debugController.post('/createAndPlayDebugGame', async (ctx) => {
  let response = await axios.post('http://localhost:3000/createGame');
  let gameId = response.data.gameId;

  response = await axios.get(`http://localhost:3000/getGame?gameId=${gameId}`);
  let player1 = response.data.player1;

  axios.post(`http://localhost:3000/playDebugGameWithDelay`, { gameId }).then(() => {
    console.info('Debug game creation is finished');
  }).catch(e => {
    console.error(e.message);
  });

  ctx.body = `http://localhost:8080/?gameId=${gameId}&playerId=${player1.id}`;
  opn(ctx.body);
});

debugController.post('/playDebugGameWithDelay', async (ctx) => {
  let gameId = ctx.request.body.gameId as string;

  let response = await axios.get(`http://localhost:3000/getGame?gameId=${gameId}`);
  let player1 = response.data.player1;
  let player2 = response.data.player2;

  const delayTime = 3000;

  await delay(5000);
  await playCardAsMana(gameId, player1.id, player1.hand[0].id);
  await delay(delayTime);
  await playCardAsMana(gameId, player1.id, player1.hand[1].id);
  await delay(delayTime);
  await playCardAsMana(gameId, player1.id, player1.hand[2].id);
  await delay(delayTime);
  await endTurn(gameId, player1.id);
  await delay(delayTime);

  await playCardAsMana(gameId, player2.id, player2.hand[0].id);
  await delay(delayTime);
  await playCardAsMana(gameId, player2.id, player2.hand[1].id);
  await delay(delayTime);
  await playCardAsMana(gameId, player2.id, player2.hand[2].id);
  await delay(delayTime);
  await endTurn(gameId, player2.id);
  await delay(delayTime);

  await playCard(gameId, player1.id, player1.hand[3].id, 1, 1);
  await delay(delayTime);
  await endTurn(gameId, player1.id);
  await delay(delayTime);

  await playCard(gameId, player2.id, player2.hand[3].id, 1, 2);
  await delay(delayTime);
  await endTurn(gameId, player2.id);
  await delay(delayTime);

  await attackCard(gameId, player1.id, player1.hand[3].id, player2.hand[3].id);
  await delay(delayTime);

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
    'http://localhost:3000/playCardAsMana',
    {playerId, cardId, gameId}
  );
}

async function playCard (gameId: string, playerId: string, cardId: string, x: number, y: number): Promise<void> {
  await axios.post(
    'http://localhost:3000/playCard',
    {gameId, playerId, cardId, x, y}
  );
}

async function attackCard (
    gameId: string, playerId: string, attackerCardId: string, attackedCardId: string
  ): Promise<void> {
  await axios.post(
    'http://localhost:3000/attackCard',
    {gameId, playerId, attackerCardId, attackedCardId}
  );
}

async function endTurn (gameId: string, playerId: string): Promise<void> {
  await axios.post('http://localhost:3000/endTurn',{gameId, playerId});
}

export {debugController};
