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

// WebSockets registr 
// научится слушать end of turn всех игр
const start = async () => {
  const socket = io(serverAddress);
  const {data: {Games}} = await axios.get(`${lobbyAddress}/methods/getGames`);
  let games = Games;

  games = games.filter((gameLobbyData) => {
    return gameLobbyData.deckName1.startsWith("AI") || gameLobbyData.deckName2.startsWith("AI");
  });

  for (let gameLobbyData of games) {
    CURRENT_GAMES[gameLobbyData.gameServerId] = gameLobbyData;
  }

  for (let gameId in CURRENT_GAMES) {
    let gameLobbyData = CURRENT_GAMES[gameId];
    socket.emit("register", {
      gameId: gameId,
      playerId: getAIDeckId(gameLobbyData)
    });
    console.log(">> Registred in", gameId);

    subToTurnOnEndOfTurn(socket, gameId, gameLobbyData);
    turn(gameId, gameLobbyData);
  }

  runCheckInterval(socket);
}

const refeshGamesList = async (socket) => {
  const {data: {Games}}= await axios.get(`${lobbyAddress}/methods/getGames`);
  let games = Games;

  games = games.filter((gameLobbyData) => {
    return !CURRENT_GAMES[gameLobbyData.gameServerId];
  })
  .filter((gameLobbyData) => {
    return gameLobbyData.deckName1.startsWith("AI") || gameLobbyData.deckName2.startsWith("AI");
  });

  for (let gameLobbyData of games) {
    CURRENT_GAMES[gameLobbyData.gameServerId] = gameLobbyData;
    const gameId = gameLobbyData.gameServerId;
    socket.emit("register", {
      gameId: gameId,
      playerId: getAIDeckId(gameLobbyData)
    });
    console.log('>> Registred in new game', gameId)
    subToTurnOnEndOfTurn(socket, gameId, gameLobbyData);
    turn(gameId, gameLobbyData);
  }
};

async function runCheckInterval(socket) {
  while (true) {
    try {
      refeshGamesList(socket);
      await wait(10 * 1000);
    } catch (e) {
      console.log("Error on refresh", e);
    }
  } 
}


start().catch(er => console.error("Catch on start", er));
