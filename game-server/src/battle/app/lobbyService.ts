import axios, { AxiosResponse } from 'axios';
import config from '../../config';

interface Games {
  games: Array<String>;
}

interface GamesData {
  Games: GameData[];
}

interface GameData {
  _id: string;
  gameServerId: string;
  deckName1: string;
  deckName2: string;
}

let lobbyService = {
  getAllGames: async (): Promise<GameData[]> => {
    let response: AxiosResponse<GamesData>;
    try {
      // response = await axios.get(lobbyMethods.GET_ALL_GAMES);
    } catch (error) {
      throw new Error('GAME: не могу достучатся до lobby. Скорее всего его забыли запустить.');
    }

    return response.data.Games;
  }
};

export {lobbyService};
