import axios from "axios";
import io from 'socket.io-client';

import {turn} from "./turn.js";
import {wait} from "./utils.js";
import {serverAddress, lobbyAddress} from "./config.js";

// При старте бота посмотреть все игры:
// игра не должна быть завершена
// в игре должен быть deck AI (или префикс)
// и нужно начинать спрашивать сервак о новых играх каждые 5 секунд
// Мы храним в какие игры мы играем
let CURRENT_GAMES = {};

// WebSockets registr 
// научится слушать end of turn всех игр
async function start() {
  const socket = io(serverAddress);
  const {data: {Games}}= await axios.get(`${lobbyAddress}/methods/getGames`);
  let games = Games;

  games = games.filter((game) => {
    return game.deckName1.startsWith("AI") || game.deckName2.startsWith("AI");
  });

  for (let game of games) {
    CURRENT_GAMES[game._id] = game;
  }

  for (let gameId in CURRENT_GAMES) {
    let game = CURRENT_GAMES[gameId];
    socket.emit("register", {
      gameId: gameId,
      playerId: getAIDeckId(game)
    });
    console.log("registered");
  }

}

function getAIDeckId(game) {
  return game[`deckId${getAIPlayerId(game)}`];
}

function getAIPlayerId(game) {
  if (game.deckName1.startsWith("AI")) {
    return "1"
  }
  if (game.deckName2.startsWith("AI")) {
    return "2"
  }

  throw new Error(`there is now AI in: ${game}`);
}


async function runInterval() {
  await turn();

  await wait(1000);

  await runInterval();
}

// runInterval();

//run().catch((e)=> console.log(e.message));
start();
