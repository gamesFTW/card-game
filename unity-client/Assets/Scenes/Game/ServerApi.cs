using System;
using System.Threading.Tasks;
using System.Collections.Generic;

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
    public string image;
    // Простите, но слишком долго делать по другому.
    // По правильному нужно хранить стеки со ссылками на карты.
    public string ownerId;

    public Abilities abilities;
}

[Serializable]
public class Abilities
{
    public RangeAbility range;
    public Boolean firstStrike;
    public ArmoredAbility armored;
    public Boolean vampiric;
    public Boolean noEnemyRetaliation;
    public Boolean piercing;
    public SpeedAbility speed;
    public FlankingAbility flanking;
    public PushAbility push;
}

[Serializable]
public class RangeAbility
{
    public int range;
    public Boolean blockedInBeginningOfTurn;
}

[Serializable]
public class ArmoredAbility
{
    public int armor;
}

[Serializable]
public class SpeedAbility
{
    public int speed;
}

[Serializable]
public class FlankingAbility
{
    public int damage;
}

[Serializable]
public class PushAbility
{
    public int range;
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
    public async static Task<GameData> GetGame(string gameId)
    {
        return await HttpRequest.Get<GameData>(Config.GAME_SERVER_URL + "getGame?gameId=" + gameId);
    }

    public async static Task<GameData> GetLastGame()
    {
        return await HttpRequest.Get<GameData>(Config.GAME_SERVER_URL + "getLastGame");
    }

    public async static Task EndOfTurn()
    {
        var values = new Dictionary<string, string>
        {
           { "gameId", GameState.gameId },
           { "playerId", GameState.playerIdWhoMakesMove }
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "endTurn", values);
    }

    public async static Task PlayCardAsMana(string cardId)
    {
        var values = new
        {
            GameState.gameId,
            playerId = GameState.mainPlayerId,
            cardId,
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "playCardAsMana", values);
    }

    public async static Task PlayCard(PlayCardAction action)
    {
        var values = new
        {
            GameState.gameId,
            playerId = GameState.mainPlayerId,
            action.cardId,
            action.x,
            action.y
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "playCard", values);
    }

    public async static Task MoveCard(MoveCardAction action)
    {
        var values = new
        {
            GameState.gameId,
           playerId = GameState.mainPlayerId,
           action.cardId,
           action.x,
           action.y
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "moveCard", values);
    }

    public async static Task AttackCard(AttackCardAction action)
    {
        var values = new
        {
            GameState.gameId,
            playerId = GameState.mainPlayerId,
            action.attackerCardId,
            action.attackedCardId,
            action.isRangeAttack,
            action.abilitiesParams
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "attackCard", values);
    }
}
