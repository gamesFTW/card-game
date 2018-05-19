import * as Router from 'koa-router';
import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { Player } from '../../domain/player/Player';
import { Card, CardCreationData } from '../../domain/card/Card';
import { mapPlayer } from './mapPlayer';
import { Field } from '../../domain/field/Field';

const gameController = new Router();

gameController.post('/createGame', async (ctx) => {
  // Temporary data
  ctx.query.playerACards = [
    {name: 'Orc1', maxHp: 10, damage: 2, mannaCost: 1, movingPoints: 3},
    {name: 'Orc2', maxHp: 10, damage: 2, mannaCost: 1, movingPoints: 3},
    {name: 'Orc3', maxHp: 10, damage: 2, mannaCost: 1, movingPoints: 3},
    {name: 'Orc4', maxHp: 10, damage: 2, mannaCost: 1, movingPoints: 3},
    {name: 'Orc5', maxHp: 10, damage: 2, mannaCost: 1, movingPoints: 3},
    {name: 'Orc6', maxHp: 10, damage: 2, mannaCost: 1, movingPoints: 3},
    {name: 'Orc7', maxHp: 10, damage: 2, mannaCost: 2, movingPoints: 3},
    {name: 'Orc8', maxHp: 10, damage: 2, mannaCost: 2, movingPoints: 3},
    {name: 'Orc9', maxHp: 10, damage: 2, mannaCost: 2, movingPoints: 3},
    {name: 'Orc10', maxHp: 10, damage: 2, mannaCost: 2, movingPoints: 3},
    {name: 'Orc11', maxHp: 10, damage: 2, mannaCost: 2, movingPoints: 3},
    {name: 'Orc12', maxHp: 10, damage: 2, mannaCost: 2, movingPoints: 3},
    {name: 'Orc13', maxHp: 10, damage: 2, mannaCost: 2, movingPoints: 3},
    {name: 'Orc Warlord', maxHp: 14, damage: 3, mannaCost: 2, movingPoints: 2}
  ];
  ctx.query.playerBCards = [
    {name: 'Elf1', maxHp: 6, damage: 1, mannaCost: 1, movingPoints: 4},
    {name: 'Elf2', maxHp: 6, damage: 1, mannaCost: 1, movingPoints: 4},
    {name: 'Elf3', maxHp: 6, damage: 1, mannaCost: 1, movingPoints: 4},
    {name: 'Elf4', maxHp: 6, damage: 1, mannaCost: 1, movingPoints: 4},
    {name: 'Elf5', maxHp: 6, damage: 1, mannaCost: 1, movingPoints: 4},
    {name: 'Elf6', maxHp: 6, damage: 1, mannaCost: 1, movingPoints: 4},
    {name: 'Elf7', maxHp: 6, damage: 1, mannaCost: 2, movingPoints: 4},
    {name: 'Elf8', maxHp: 6, damage: 1, mannaCost: 2, movingPoints: 4},
    {name: 'Elf9', maxHp: 6, damage: 1, mannaCost: 2, movingPoints: 4},
    {name: 'Elf10', maxHp: 6, damage: 1, mannaCost: 2, movingPoints: 4},
    {name: 'Elf11', maxHp: 6, damage: 1, mannaCost: 2, movingPoints: 4},
    {name: 'Elf12', maxHp: 6, damage: 1, mannaCost: 2, movingPoints: 4},
    {name: 'Elf13', maxHp: 6, damage: 1, mannaCost: 2, movingPoints: 4},
    {name: 'Elf14', maxHp: 6, damage: 1, mannaCost: 2, movingPoints: 4}
  ];

  let playerACardsData = ctx.query.playerACards as Array<CardCreationData>;
  let playerBCardsData = ctx.query.playerBCards as Array<CardCreationData>;

  let game = new Game();
  let {player1, player2, player1Cards, player2Cards, field} = game.create(playerACardsData, playerBCardsData);

  await Repository.save([player1Cards, player1, player2Cards, player2, field, game]);

  ctx.body = `Game created. id: ${game.id}.`;
});

gameController.get('/getGame', async (ctx) => {
  let gameId = ctx.query.gameId as EntityId;

  let game = await Repository.get<Game>(gameId, Game);

  let field = await Repository.get<Field>(game.fieldId, Field);

  let player1 = await Repository.get<Player>(game.player1Id, Player);
  let player2 = await Repository.get<Player>(game.player2Id, Player);

  let player1Response = await mapPlayer(player1, field);
  let player2Response = await mapPlayer(player2, field);

  ctx.body = `Game: ${JSON.stringify(game, undefined, 2)}
Player1: ${player1Response}
Player2: ${player2Response}`;
});

gameController.post('/endTurn', async (ctx) => {
  let gameId = ctx.query.gameId as EntityId;
  // TODO: playerId нужно доставать из сессии
  let endingTurnPlayerId = ctx.query.playerId as EntityId;

  let game = await Repository.get<Game>(gameId, Game);

  let endingTurnPlayerOpponentId = game.getPlayerIdWhichIsOpponentFor(endingTurnPlayerId);

  let endingTurnPlayer = await Repository.get<Player>(endingTurnPlayerId, Player);
  let endingTurnPlayerOpponent = await Repository.get<Player>(endingTurnPlayerOpponentId, Player);

  let endingTurnPlayerMannaPoolCards = await Repository.getMany <Card>(endingTurnPlayer.mannaPool, Card);
  let endingTurnPlayerTableCards = await Repository.getMany <Card>(endingTurnPlayer.table, Card);

  game.endTurn(endingTurnPlayer, endingTurnPlayerOpponent, endingTurnPlayerMannaPoolCards, endingTurnPlayerTableCards);

  await Repository.save([
    game, endingTurnPlayer, endingTurnPlayerOpponent,
    endingTurnPlayerMannaPoolCards, endingTurnPlayerTableCards
  ]);

  ctx.body = `Ok`;
});

export {gameController};
