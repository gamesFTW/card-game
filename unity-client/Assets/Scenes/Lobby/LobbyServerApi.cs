﻿using System;
using Cysharp.Threading.Tasks;

namespace Lobby
{
    [Serializable]
    public class GamesData
    {
        public GameData[] Games;
    }

    [Serializable]
    public class GameData
    {
        public string _id;
        public string gameServerId;
        public string deckName1;
        public string deckName2;
    }

    [Serializable]
    public class DecksData
    {
        public DeckData[] Decks;
    }

    [Serializable]
    public class DeckData
    {
        public string _id;
        public string name;
    }

    [Serializable]
    public class SinglePlayerGameData
    {
        public string lobbyGameId;
        public string gameServerId;
        public string playerId;
        public string aiId;
    }

    [Serializable]
    public class FoundGame
    {
        public bool gameFound;
        public string gameId;
        public string playerId;
        public string opponentId;
    }

    public class LobbyServerApi
    {
        public static UniTask<GamesData> GetGames<GamesData>()
        {
            return HttpRequest.Get<GamesData>(Config.LOBBY_SERVER_URL + "methods/getGames");
        }

        public async static UniTask<DecksData> GetDecks<DecksData>()
        {
            return await HttpRequest.Get<DecksData>(Config.LOBBY_SERVER_URL + "publications/Decks");
        }

        public async static UniTask<DecksData> GetPlayerDecks<DecksData>()
        {
            return await HttpRequest.Get<DecksData>(Config.LOBBY_SERVER_URL + "methods/getPlayerDecks");
        }

        public async static UniTask CreateGame(string player1DeckId, string player2DeckId)
        {
            var values = new
            {
                deckId1 = player1DeckId,
                deckId2 = player2DeckId
            };

            await HttpRequest.Post(Config.LOBBY_SERVER_URL + "methods/createGame", values);
        }

        public async static UniTask<SinglePlayerGameData> CreateSinglePlayerGame(string player1DeckId)
        {
            var values = new
            {
                deckId1 = player1DeckId
            };

            return await HttpRequest.Post<SinglePlayerGameData>(Config.LOBBY_SERVER_URL + "methods/createSinglePlayerGame", values);
        }

        public async static UniTask<SinglePlayerGameData> CreateTutorialGame()
        {
            return await HttpRequest.Post<SinglePlayerGameData>(Config.LOBBY_SERVER_URL + "methods/createTutorialGame");
        }

        public async static UniTask DeleteGame(string gameId)
        {

            var values = new
            {
                gameLobbyId = gameId
            };

            await HttpRequest.Post(Config.LOBBY_SERVER_URL + "methods/removeGameById", values);
        }

        public async static UniTask<FoundGame> FindOpponent(string deckId)
        {
            var values = new
            {
                deckId = deckId
            };

            return await HttpRequest.Post<FoundGame>(Config.LOBBY_SERVER_URL + "methods/findMultyplayerGame", values);
        }
    }
}
