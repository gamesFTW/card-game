import { turn } from "./turn.js";

export const getAIDeckId = (game) => {
    return game[`deckId${getAIPlayerId(game)}`];
};
  
export const getAIPlayerId = (game) => {
    if (isAIName(game.deckName1)) {
      return "1"
    }
    if (isAIName(game.deckName2)) {
      return "2"
    }
  
    throw new Error(`there is now AI in: ${game}`);
};

export const isAIName = (deckName) => {
    return deckName.startsWith("AI");
}

export const subToTurnOnEndOfTurn = async (socket, gameId, gameLobbyData) => {
    socket.on("event", async ({actions}) => {
        const isEndOfTurn = actions.some(({type}) => type === "EndTurnAction");
        if (isEndOfTurn) {
          try {
            await turn(gameId, gameLobbyData);
          } catch (e) {
            console.error(e);
          }
        }
    });
}
  
