using UnityEngine;
using System;
using Newtonsoft.Json;
using UnibusEvent;
using System.Collections.Generic;
using System.Reflection;

[Serializable]
public class Point
{
    public int x;
    public int y;

    public Point(int x, int y)
    {
        this.x = x;
        this.y = y;
    }
}

namespace ServerActions
{
    [Serializable]
    public class EndTurnAction
    {
        public int currentTurn;
        public string endedPlayerId;
        public string startedPlayerId;
        public string[] cardsDrawn;
        public CardChanges[] cardChanges;
        public bool gameEnded;
        public string lostPlayerId;
        public string wonPlayerId;
    }

    [Serializable]
    public class PlayCardAsManaAction
    {
        public string cardId;
        public string playerId;
        public bool tapped;
    }

    [Serializable]
    public class PlayCardAction
    {
        public string cardId;
        public string playerId;
        public string[] manaCardsTapped;
        public int newHp;
        public bool tapped;
        public Point position;
    }

    [Serializable]
    public class MoveCardAction
    {
        public string cardId;
        public string playerId;
        public Point position;
        public Point[] path;
        public int currentMovingPoints;
    }

    [Serializable]
    public class CardAttackedAction
    {
        public string attackerCardId;
        public string attackedCardId;
        public CardChanges[] cardChanges;
    }

    [Serializable]
    public class CardHealedAction
    {
        public CardAfterHealing healerCard;
        public CardAfterHealing healedCard;
    }

    [Serializable]
    public class CardUsedManaAbilityAction
    {
        public string playerId;
        public string tappedCardId;
        public string[] cardsUntapped;
    }

    [Serializable]
    public class BaseAction
    {
        public string playerId;
        public CardChanges[] cardChanges;
    }

    [Serializable]
    public class CardChanges
    {
        public string id;
        public bool isTapped;
        public bool isUntapped;
        public int? newHp;
        public bool killed;
        public int? currentMovingPoints;
        public Point pushedTo;
        public bool? blockedRangeAbilityInBeginningOfTurn;
        public bool? usedInThisTurnBlockAbility;
        public bool? usedInThisTurnEvasionAbility;
        public bool? isPoisoned;
        public int? poisonDamage;
        public bool? isDamageCursed;
        public int? damageCursedDamageReduction;
        public int? damage;
        public int? hpAuraBuffChange;
        public int? numberOfAiming;
    }

    [Serializable]
    public class CardAfterHealing
    {
        public string id;
        public bool isTapped;
        public int? newHp;
        public int? currentMovingPoints;
    }
}

public class ReceiverFromServer : MonoBehaviour
{
    private CardManager cardManger;
    private UIManager uiManager;

    void Awake()
    {
        this.cardManger = this.GetComponent<CardManager>();
        this.uiManager = this.GetComponent<UIManager>();
    }

    public void ProcessAction(string type, string message)
    {
        if (type == "EndTurnAction")
        {
            SocketData<ServerActions.EndTurnAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.EndTurnAction>>(message);
            this.cardManger.OnEndTurn(data.actions[0]);
        }

        if (type == "PlayCardAsManaAction")
        {
            SocketData<ServerActions.PlayCardAsManaAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.PlayCardAsManaAction>>(message);
            this.cardManger.OnPlayCardAsMana(data.actions[0]);
        }

        if (type == "MoveCardAction")
        {
            SocketData<ServerActions.MoveCardAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.MoveCardAction>>(message);
            this.cardManger.OnMoveCard(data.actions[0]);
        }

        if (type == "PlayCardAction")
        {
            SocketData<ServerActions.PlayCardAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.PlayCardAction>>(message);
            this.cardManger.OnPlayCard(data.actions[0]);
        }

        if (type == "CardAttackedAction")
        {
            SocketData<ServerActions.CardAttackedAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.CardAttackedAction>>(message);
            this.cardManger.OnCardAttacked(data.actions[0]);
        }

        if (type == "CardHealedAction")
        {
            SocketData<ServerActions.CardHealedAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.CardHealedAction>>(message);
            this.cardManger.OnCardHealed(data.actions[0]);
        }

        if (type == "CardUsedManaAbilityAction")
        {
            SocketData<ServerActions.CardUsedManaAbilityAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.CardUsedManaAbilityAction>>(message);
            this.cardManger.OnCardUsedManaAbility(data.actions[0]);
        }

        if (type == "CardAimedAction")
        {
            SocketData<ServerActions.BaseAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.BaseAction>>(message);
            this.cardManger.OnCardAimed(data.actions[0]);
        }
    }

    public void ProcessActions(List<string> actionsTypes, string message)
    {
        if (actionsTypes[0] == "MoveCardAction" && actionsTypes[1] == "CardAttackedAction")
        {
            ServerActions.MoveCardAction moveCardAction = JsonConvert.DeserializeObject<SocketData<ServerActions.MoveCardAction>>(message).actions[0];
            ServerActions.CardAttackedAction cardAttackedAction = JsonConvert.DeserializeObject<SocketData<ServerActions.CardAttackedAction>>(message).actions[1];

            this.cardManger.OnMoveAndAttack(moveCardAction, cardAttackedAction);
        }
    }
}
