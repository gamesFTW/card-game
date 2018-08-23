import axios, { AxiosResponse } from 'axios';

interface Games {
  games: Array<String>;
}

let LOBBY_URL = 'http://localhost:3001/';

let lobbyMethods = {
  GET_ALL_GAMES: LOBBY_URL + 'games'
};

let lobbyService = {
  getAllGames: async (): Promise<Array<String>> => {
    let response = await axios.get(lobbyMethods.GET_ALL_GAMES);
    return response.data.games;
  }
};

export {lobbyService};
