using UnityEngine;
using System;
using Newtonsoft.Json;
using UnibusEvent;

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
    public class CardChanges
    {
        public string id;
        public bool isTapped;
        public bool isUntapped;
        public int? newHp;
        public bool killed;
        public int? currentMovingPoints;
        public Point pushedTo;
        public bool? usedInThisTurnBlockAbility;
        public bool? usedInThisTurnEvasionAbility;
        public bool? isPoisoned;
        public int? poisonDamage;
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
    public static readonly string TURN_ENDED = "TURN_ENDED";

    private CardManager cardManger;

    void Awake()
    {
        cardManger = this.GetComponent<CardManager>();
    }

    public void ProcessAction(string type, int index, string message)
    {
        if (type == "EndTurnAction")
        {
            SocketData<ServerActions.EndTurnAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.EndTurnAction>>(message);
            this.OnEndTurnAction(data.actions[index]);
        }

        if (type == "PlayCardAsManaAction")
        {
            SocketData<ServerActions.PlayCardAsManaAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.PlayCardAsManaAction>>(message);
            this.OnPlayCardAsManaAction(data.actions[index]);
        }

        if (type == "MoveCardAction")
        {
            SocketData<ServerActions.MoveCardAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.MoveCardAction>>(message);
            this.OnMoveCardAction(data.actions[index]);
        }

        if (type == "PlayCardAction")
        {
            SocketData<ServerActions.PlayCardAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.PlayCardAction>>(message);
            this.OnPlayCardAction(data.actions[index]);
        }

        if (type == "CardAttackedAction")
        {
            SocketData<ServerActions.CardAttackedAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.CardAttackedAction>>(message);
            this.OnCardAttackedAction(data.actions[index]);
        }

        if (type == "CardHealedAction")
        {
            SocketData<ServerActions.CardHealedAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.CardHealedAction>>(message);
            this.OnCardHealedAction(data.actions[index]);
        }

        if (type == "CardUsedManaAbilityAction")
        {
            SocketData<ServerActions.CardUsedManaAbilityAction> data = JsonConvert.DeserializeObject<SocketData<ServerActions.CardUsedManaAbilityAction>>(message);
            this.OnCardUsedManaAbilityAction(data.actions[index]);
        }
    }

    public void OnEndTurnAction(ServerActions.EndTurnAction action)
    {
        foreach (ServerActions.CardChanges card in action.cardChanges)
        {
            cardManger.ApplyChangesToCard(card);
        }

        cardManger.DrawCards(action.endedPlayerId, action.cardsDrawn);

        GameState.playerIdWhoMakesMove = action.startedPlayerId;

        Unibus.Dispatch(TURN_ENDED, action.startedPlayerId);
    }

    public void OnPlayCardAction(ServerActions.PlayCardAction action)
    {
        cardManger.PlayCard(action.playerId, action.cardId, action.position, action.tapped, action.newHp);
        cardManger.TapCards(action.playerId, action.manaCardsTapped);
    }

    public void OnPlayCardAsManaAction(ServerActions.PlayCardAsManaAction action)
    {
        cardManger.PlayCardAsMana(action.playerId, action.cardId, action.tapped);
    }

    public void OnMoveCardAction(ServerActions.MoveCardAction action)
    {
        cardManger.MoveCard(action.playerId, action.cardId, action.position, action.currentMovingPoints, action.path);
    }

    public void OnCardAttackedAction(ServerActions.CardAttackedAction action)
    {
        foreach (ServerActions.CardChanges card in action.cardChanges)
        {
            var isAttacker = card.id == action.attackerCardId;
            cardManger.CardWasInBattle(card, isAttacker);
        }
    }

    public void OnCardHealedAction(ServerActions.CardHealedAction action)
    {
        cardManger.CardAfterHealing(action.healerCard);
        cardManger.CardAfterHealing(action.healedCard);
    }

    public void OnCardUsedManaAbilityAction(ServerActions.CardUsedManaAbilityAction action)
    {
        cardManger.TapCards(action.playerId, new string[] { action.tappedCardId });
        cardManger.UntapCards(action.playerId, action.cardsUntapped);
    }
}
