﻿using System;
using UnityEngine;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;

[Serializable]
public class CardData
{
    public string id;
    public Boolean hero;
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
    public Dictionary<string, SoundData> sounds;
    // Простите, но слишком долго делать по другому.
    // По правильному нужно хранить стеки со ссылками на карты.
    // TODO: Перенести это хотя бы в Card. И больше так не делать.
    public string ownerId;

    public Abilities abilities;
    public NegativeEffects negativeEffects;
    public PositiveEffects positiveEffects;
}

[Serializable]
public class SoundData
{
    public string soundName;
    public string url;
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
    public Boolean ricochet;
    public HealingAbility healing;
    public BlockAbility block;
    public ManaAbility mana;
    public RegenerationsAbility regeneration;
    public Boolean bash;
    public EvasionAbility evasion;
    public PoisonAbility poison;
    public DamageCurseAbility damageCurse;
    public AOEAbility aoe;
    public HPAuraAbility hpAura;
    public AimingAbility aiming;
}

[Serializable]
public class Ability
{
}

[Serializable]
public class RangeAbility : Ability
{
    public int range;
    public int minRange;
    public Boolean blockedInBeginningOfTurn;
}

[Serializable]
public class ArmoredAbility : Ability
{
    public int armor;
}

[Serializable]
public class SpeedAbility : Ability
{
    public int speed;
}

[Serializable]
public class FlankingAbility : Ability
{
    public int damage;
}

[Serializable]
public class PushAbility : Ability
{
    public int range;
}

[Serializable]
public class HealingAbility : Ability
{
    public int range;
    public int heal;
}

[Serializable]
public class BlockAbility : Ability
{
    public int range;
    public int blockingDamage;
    public bool usedInThisTurn;
}

[Serializable]
public class ManaAbility : Ability
{
    public int mana;
}

[Serializable]
public class RegenerationsAbility : Ability
{
    public int regeneration;
}

[Serializable]
public class EvasionAbility : Ability
{
    public bool usedInThisTurn;
}

[Serializable]
public class PoisonAbility : Ability
{
    public int poisonDamage;
}

[Serializable]
public class DamageCurseAbility : Ability
{
    public int damageReduction;
}

[Serializable]
public class AOEAbility : Ability
{
    public int range;
    public bool diagonal;
}

[Serializable]
public class HPAuraAbility : Ability
{
    public int range;
    public int hpBuff;
}

[Serializable]
public class AimingAbility : Ability
{
    public int numberOfAimingForAttack;
    public int numberOfAiming;
}


[Serializable]
public class NegativeEffects
{
    public PoisonEffect poisoned;
    public DamageCurseEffect damageCursed;
}

[Serializable]
public class PoisonEffect
{
    public int damage;
}

[Serializable]
public class DamageCurseEffect
{
    public int damageReduction;
}


[Serializable]
public class PositiveEffects
{
    public HPAuraBuffEffect hpAuraBuff;
}

[Serializable]
public class HPAuraBuffEffect
{
    public int hpBuff;
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
    public bool gameEnded;
    public string lostPlayerId;
    public string wonPlayerId;
}

[Serializable]
public class AreaData
{
    public string id;
    public int x;
    public int y;
    public string type;
    public string subtype;
    public bool canUnitsWalkThoughtIt;
    public bool canUnitsShootThoughtIt;
}

[Serializable]
public class GameData
{
    public GameInfoData game;
    public PlayerData player1;
    public PlayerData player2;
    public AreaData[] areas;
}

public class ServerApi
{
    public async static UniTask<GameData> GetGame(string gameId)
    {
        return await HttpRequest.Get<GameData>(Config.GAME_SERVER_URL + "getGame?gameId=" + gameId);
    }

    public async static UniTask<GameData> GetLastGame()
    {
        return await HttpRequest.Get<GameData>(Config.GAME_SERVER_URL + "getLastGame");
    }

    public async static UniTask EndOfTurn()
    {
        var values = new Dictionary<string, string>
        {
           { "gameId", GameState.gameId },
           { "playerId", GameState.playerIdWhoMakesMove }
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "endTurn", values);
    }

    public async static UniTask PlayCardAsMana(string cardId)
    {
        var values = new
        {
            GameState.gameId,
            playerId = GameState.mainPlayerId,
            cardId,
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "playCardAsMana", values);
    }

    public async static UniTask PlayCard(PlayCardAction action)
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

    public async static UniTask MoveCard(MoveCardAction action)
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

    public async static UniTask AttackCard(AttackCardAction action)
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

    public async static UniTask MoveAndAttackCard(AttackCardAction action)
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

        await HttpRequest.Post(Config.GAME_SERVER_URL + "moveAndAttackCard", values);
    }

    public async static UniTask HealCard(HealCardAction action)
    {
        var values = new
        {
            GameState.gameId,
            playerId = GameState.mainPlayerId,
            action.healerCardId,
            action.healedCardId
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "healCard", values);
    }

    public async static UniTask UseManaAbility(SimpleAbilityCardAction action)
    {
        var values = new
        {
            GameState.gameId,
            playerId = GameState.mainPlayerId,
            action.cardId
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "useManaAbility", values);
    }

    public async static UniTask ToAim(SimpleAbilityCardAction action)
    {
        var values = new
        {
            GameState.gameId,
            playerId = GameState.mainPlayerId,
            action.cardId
        };

        await HttpRequest.Post(Config.GAME_SERVER_URL + "toAim", values);
    }
}
