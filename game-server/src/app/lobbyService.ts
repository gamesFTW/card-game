import axios, { AxiosResponse } from 'axios';
import {cardPlaceChangePosition} from '../../../client/src/UI/store/cards/actions';

interface Games {
  games: Array<String>;
}

let LOBBY_URL = 'http://localhost:3001/';

let lobbyMethods = {
  GET_ALL_GAMES: LOBBY_URL + 'games'
};

let lobbyService = {
  getAllGames: async (): Promise<Array<String>> => {
    let response;
    try {
      response = await axios.get(lobbyMethods.GET_ALL_GAMES);
    } catch (error) {
      throw new Error('GAME: не могу достучатся до lobby. Скорее всего его забыли запустить.');
    }

    return response.data.games;
  }
};

export {lobbyService};
