import { LobbyUseCasas } from './LobbyUseCases';

type CreatingGame = {
  gameId: string,
  deckId: string,
  playerId?: string,
  opponentId?: string,
  gameFound: boolean,
  resolveWaitingPlayer?: (value: CreatingGame) => void,
}

class MatchMaker {
  private lobbyUseCasas: LobbyUseCasas;
  private creatingGames = new Set<CreatingGame>();

  constructor(lobbyUseCasas: LobbyUseCasas) {
    this.lobbyUseCasas = lobbyUseCasas;
  }

  public async findMultyplayerGame(myDeckId: string) {
    if (this.creatingGames.size > 0) {
      // Нашли другого игрока, играем с ним
      const creatingGame = this.creatingGames.keys().next().value;
      const game = await this.lobbyUseCasas.createGame(myDeckId, creatingGame.deckId);

      creatingGame.gameId = game.gameId;
      creatingGame.playerId = game.playerOfDeckId2;
      creatingGame.opponentId = game.playerOfDeckId1;
      creatingGame.resolveWaitingPlayer(creatingGame);

      return {
        gameId: game.gameId,
        playerId: game.playerOfDeckId1,
        opponentId: game.playerOfDeckId2,
        gameFound: true
      };
    }

    let timeoutId: NodeJS.Timeout;

    const creatingGame: CreatingGame = {
      gameId: null, deckId: myDeckId, gameFound: false
    };
  
    const resultOfWaitingPromise = new Promise((resolve: (value: CreatingGame) => void, reject) => {
      creatingGame.resolveWaitingPlayer = resolve;
      this.creatingGames.add(creatingGame);

      timeoutId = setTimeout(() => {
        reject();
      }, 10000);
    });

    try {
      let resultOfWaiting = await resultOfWaitingPromise;
      clearTimeout(timeoutId);
      this.creatingGames.delete(creatingGame);
      return {
        gameId: resultOfWaiting.gameId,
        playerId: resultOfWaiting.playerId,
        opponentId: resultOfWaiting.opponentId,
        gameFound: true
      };
    } catch(error) {
      this.creatingGames.delete(creatingGame);
      return { gameFound: false };
    }
  }
}

export { MatchMaker }
