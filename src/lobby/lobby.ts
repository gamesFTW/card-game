import { GameModel, GameStatus, connectToDb } from './db/db';

class Lobby {
  static instance: Lobby = null;

  constructor () {
    connectToDb();
  }

  static getInstance (): Lobby {
    if (!Lobby.instance) {
      Lobby.instance = new Lobby();
    }
    return Lobby.instance;
  }

  public async addGame (gameId: String): Promise<void> {
    const game = new GameModel({ gameId, status: GameStatus.NEW });
    await game.save();
  }

  public async getAllGameIds (): Promise<String[]> {
    const games = await GameModel.find({});
    return games.map(g => g.gameId);
  }
}

export { Lobby };
