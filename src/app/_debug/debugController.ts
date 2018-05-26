import * as Router from 'koa-router';
import axios from 'axios';

const debugController = new Router();

debugController.post('/createDebugGame', async (ctx) => {
  let response = await axios.post('http://localhost:3000/createGame');
  let gameId = response.data.gameId;

  response = await axios.get(`http://localhost:3000/getGame?gameId=${gameId}`);
  let player1 = response.data.player1;
  let player2 = response.data.player2;

  await playCardAsManna(player1.id, player1.hand[0].id);
  await playCardAsManna(player1.id, player1.hand[1].id);
  await playCardAsManna(player1.id, player1.hand[2].id);
  await endTurn(gameId, player1.id);

  await playCardAsManna(player2.id, player2.hand[0].id);
  await playCardAsManna(player2.id, player2.hand[1].id);
  await playCardAsManna(player2.id, player2.hand[2].id);
  await endTurn(gameId, player2.id);

  await playCard(gameId, player1.id, player1.hand[3].id, 2, 2);
  await endTurn(gameId, player1.id);

  await playCard(gameId, player2.id, player2.hand[3].id, 2, 3);
  await endTurn(gameId, player2.id);

  await attackCard(gameId, player1.id, player1.hand[3].id, player2.hand[3].id);

  ctx.body = {gameId};
});

async function playCardAsManna (playerId: string, cardId: string): Promise<void> {
  await axios.post(
    'http://localhost:3000/playCardAsManna',
    {playerId, cardId}
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
