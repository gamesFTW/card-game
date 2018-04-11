import * as Router from 'koa-router';
import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { Player } from '../../domain/player/Player';
import { GameEventType, PlayerEventType } from '../../domain/events';

const gameController = new Router();

gameController.get('/createGame', async (ctx) => {
  // Temporary data
  ctx.query.playerACards = [
    {name: 'Orc1', maxHp: 10, damage: 2},
    {name: 'Orc2', maxHp: 10, damage: 2},
    {name: 'Orc3', maxHp: 10, damage: 2},
    {name: 'Orc4', maxHp: 10, damage: 2},
    {name: 'Orc5', maxHp: 10, damage: 2},
    {name: 'Orc6', maxHp: 10, damage: 2},
    {name: 'Orc7', maxHp: 10, damage: 2},
    {name: 'Orc8', maxHp: 10, damage: 2},
    {name: 'Orc9', maxHp: 10, damage: 2},
    {name: 'Orc10', maxHp: 10, damage: 2},
    {name: 'Orc11', maxHp: 10, damage: 2},
    {name: 'Orc12', maxHp: 10, damage: 2},
    {name: 'Orc13', maxHp: 10, damage: 2},
    {name: 'Orc Warlord', maxHp: 14, damage: 3}
  ];
  ctx.query.playerBCards = [
    {name: 'Elf1', maxHp: 6, damage: 1},
    {name: 'Elf2', maxHp: 6, damage: 1},
    {name: 'Elf3', maxHp: 6, damage: 1},
    {name: 'Elf4', maxHp: 6, damage: 1},
    {name: 'Elf5', maxHp: 6, damage: 1},
    {name: 'Elf6', maxHp: 6, damage: 1},
    {name: 'Elf7', maxHp: 6, damage: 1},
    {name: 'Elf8', maxHp: 6, damage: 1},
    {name: 'Elf9', maxHp: 6, damage: 1},
    {name: 'Elf10', maxHp: 6, damage: 1},
    {name: 'Elf11', maxHp: 6, damage: 1},
    {name: 'Elf12', maxHp: 6, damage: 1},
    {name: 'Elf13', maxHp: 6, damage: 1},
    {name: 'Elf14', maxHp: 6, damage: 1}
  ];

  let playerACardsData = ctx.query.playerACards;
  let playerBCardsData = ctx.query.playerBCards;

  let game = new Game();
  let {player1, player2, player1Cards, player2Cards} = game.create(playerACardsData, playerBCardsData);

  await Repository.save(player1Cards);
  await Repository.save(player1);
  await Repository.save(player2Cards);
  await Repository.save(player2);
  await Repository.save(game);

  ctx.body = `Game created. id: ${game.id}.`;
});

gameController.get('/getGame', async (ctx) => {
  let id = ctx.query.id as EntityId;
  let game = await Repository.get<Game>(id, Game);

  let player1 = await Repository.get<Player>(game.player1Id, Player);
  let player2 = await Repository.get<Player>(game.player2Id, Player);

  console.log('Game:', game);
  console.log('Player1:', player1);
  console.log('Player2:', player2);

  ctx.body = `Game id: ${game.id}.`;
});

export {gameController};
