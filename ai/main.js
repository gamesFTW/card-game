import axios from "axios";
import io from 'socket.io-client';

import {turn} from "./turn.js";
import {wait} from "./utils.js";
import {serverAddress, lobbyAddress} from "./config.js";
import { getAIDeckId, subToTurnOnEndOfTurn } from "./helpers.js";

// При старте бота посмотреть все игры:
// игра не должна быть завершена
// в игре должен быть deck AI (или префикс)
// и нужно начинать спрашивать сервак о новых играх каждые 5 секунд
// Мы храним в какие игры мы играем
let CURRENT_GAMES = {};
let KNOWN_GAMES = {};

// WebSockets registr 
// научится слушать end of turn всех игр
const start = async () => {
  const {data: {Games}} = await axios.get(`${lobbyAddress}/methods/getGames`);
  let games = Games;

  games = games.filter((gameLobbyData) => {
    return gameLobbyData.deckName1.startsWith("AI") || gameLobbyData.deckName2.startsWith("AI");
  });

  for (let gameLobbyData of games) {
    CURRENT_GAMES[gameLobbyData.gameServerId] = gameLobbyData;
    KNOWN_GAMES[gameLobbyData.gameServerId] = true;
  }

  for (let gameId in CURRENT_GAMES) {
    const socket = io(serverAddress);
    let gameLobbyData = CURRENT_GAMES[gameId];

    socket.emit("register", {
      gameId: gameId,
      playerId: getAIDeckId(gameLobbyData)
    });
    console.log(">> Registred in", gameId);

    subToTurnOnEndOfTurn(socket, gameId, gameLobbyData, CURRENT_GAMES);
    turn(gameId, gameLobbyData, CURRENT_GAMES, socket);
  }

  runCheckInterval();
}

const refeshGamesList = async (socket) => {
  const {data: {Games}}= await axios.get(`${lobbyAddress}/methods/getGames`);
  let games = Games;

  games = games.filter((gameLobbyData) => {
    return !KNOWN_GAMES[gameLobbyData.gameServerId];
  })
  .filter((gameLobbyData) => {
    return gameLobbyData.deckName1.startsWith("AI") || gameLobbyData.deckName2.startsWith("AI");
  });

  for (let gameLobbyData of games) {
    const socket = io(serverAddress);
    CURRENT_GAMES[gameLobbyData.gameServerId] = gameLobbyData;
    KNOWN_GAMES[gameLobbyData.gameServerId] = true;
    const gameId = gameLobbyData.gameServerId;
    socket.emit("register", {
      gameId: gameId,
      playerId: getAIDeckId(gameLobbyData)
    });
    console.log('>> Registred in new game', gameId)
    subToTurnOnEndOfTurn(socket, gameId, gameLobbyData, CURRENT_GAMES);
    turn(gameId, gameLobbyData, CURRENT_GAMES, socket);
  }
};

async function runCheckInterval() {
  while (true) {
    try {
      refeshGamesList();
      await wait(10 * 1000);
    } catch (e) {
      console.log("Error on refresh", e);
    }
  } 
}


start().catch(er => console.error("Catch on start", er));
