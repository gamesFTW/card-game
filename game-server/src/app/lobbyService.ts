import axios, { AxiosResponse } from 'axios';
import {cardPlaceChangePosition} from '../../../client/src/UI/store/cards/actions';
import config from '../config';

interface Games {
  games: Array<String>;
}

let lobbyMethods = {
  GET_ALL_GAMES: config.LOBBY_URL + 'games'
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
