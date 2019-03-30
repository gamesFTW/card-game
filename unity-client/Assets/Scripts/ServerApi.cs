using UnityEngine;
using System.Net;
using System.IO;
using System;
using UnityEngine.Networking;
using System.Collections;
using System.Threading.Tasks;
using System.Net.Http;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;

[Serializable]
public class CardData
{
    public string id;
    public Boolean alive;
    public Boolean tapped;
    public string name;
    public int maxHp;
    public int damage;
    public int manaCost;
    public int movingPoints;
    public int currentMovingPoints;
    public int currentHp;
    public int x;
    public int y;
    // Простите, но слишком долго делать по другому.
    // По правильному нужно хранить стеки со ссылками на карты.
    public string ownerId;
}

[Serializable]
public class PlayerData
{
    public string id;
    public CardData[] deck;
    public CardData[] hand;
    public CardData[] manaPool;
    public CardData[] table;
    public CardData[] graveyard;
}

[Serializable]
public class GameInfoData
{
    public string id;
    public string player1Id;
    public string player2Id;
    public string currentPlayersTurn;
    public string boardId;
    public int currentTurn;
}

[Serializable]
public class GameData
{
    public GameInfoData game;
    public PlayerData player1;
    public PlayerData player2;
}

public class ServerApi
{
    static public String gameId = "";
    static public String mainPlayerId = "";
    static public String enemyOfMainPlayerId = "";
    static public String serverURL = "http://127.0.0.1:3000";

    public async static Task<GameData> GetGame()
    {
        var httpClient = new HttpClient();
        var response = await httpClient.GetAsync(String.Format(serverURL + "/getLastGame"));
        response.EnsureSuccessStatusCode();

        string responseContent = await response.Content.ReadAsStringAsync();

        Debug.Log(responseContent);

        GameData gameData = JsonConvert.DeserializeObject<GameData>(responseContent);

        gameId = gameData.game.id;
        mainPlayerId = gameData.game.player1Id;
        enemyOfMainPlayerId = gameData.game.player2Id;

        GameState.playerIdWhoMakesMove = gameData.game.currentPlayersTurn;

        return gameData;
    }

    public async static Task EndOfTurn()
    {
        var values = new Dictionary<string, string>
        {
           { "gameId", gameId },
           { "playerId", GameState.playerIdWhoMakesMove }
        };

        await HttpRequest.Post("/endTurn", values);
    }

    public async static Task PlayCardAsMana(string cardId)
    {
        var values = new
        {
            gameId,
            playerId = mainPlayerId,
            cardId,
        };

        await HttpRequest.Post("/playCardAsMana", values);
    }

    public async static Task PlayCard(PlayCardAction action)
    {
        var values = new
        {
            gameId,
            playerId = mainPlayerId,
            action.cardId,
            action.x,
            action.y
        };

        await HttpRequest.Post("/playCard", values);
    }

    public async static Task MoveCard(MoveCardAction action)
    {
        var values = new
        {
           gameId,
           playerId = mainPlayerId,
           action.cardId,
           action.x,
           action.y
        };

        await HttpRequest.Post("/moveCard", values);
    }

    public async static Task AttackCard(AttackCardAction action)
    {
        var values = new
        {
            gameId,
            playerId = mainPlayerId,
            action.attackerCardId,
            action.attackedCardId,
            action.isRangeAttack
        };

        await HttpRequest.Post("/attackCard", values);
    }
}
