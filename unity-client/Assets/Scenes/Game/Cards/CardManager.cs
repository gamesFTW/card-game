using System;
using System.Collections;
using System.Collections.Generic;
using UnibusEvent;
using UnityEngine;

public class CardManager : MonoBehaviour
{
    public static readonly string CARD_ATTACKED = "CardManager:CARD_ATTACKED";
    public static readonly string CARD_PLAYED = "CardManager:CARD_PLAYED";
    public static readonly string CARD_DIED = "CardManager:CARD_DIED";
    public static readonly string CARD_MOVED = "CardManager:CARD_MOVED";
    public static readonly string CARD_SELECTED = "CardManager:CARD_SELECTED";
    public static readonly string CARD_HEALED = "CardManager:CARD_HEALED";
    public static readonly string TURN_ENDED = "CardManager:TURN_ENDED";

    private Dictionary<string, Transform> cardIdToCards;
    private Dictionary<string, PlayerTransformsStacks> playerStacks;

    private BoardCreator boardCreator;
    private UIManager uiManager;

    void Awake()
    {
        this.uiManager = this.GetComponent<UIManager>();
        this.boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();
    }

    public void Init()
    {
        CardCreator cardCreator = this.GetComponent<CardCreator>();

        cardIdToCards = cardCreator.cardIdToCards;
        playerStacks = cardCreator.playersTransformsStacks;
    }

    public void OnEndTurn(ServerActions.EndTurnAction action)
    {
        foreach (ServerActions.CardChanges card in action.cardChanges)
        {
            this.ApplyChangesToCard(card);
        }

        this.DrawCards(action.endedPlayerId, action.cardsDrawn);

        GameState.playerIdWhoMakesMove = action.startedPlayerId;

        if (action.gameEnded)
        {
            GameState.gameData.game.lostPlayerId = action.lostPlayerId;
            GameState.gameData.game.wonPlayerId = action.wonPlayerId;
            this.uiManager.ShowWinStatus();
        }
        else
        {
            this.uiManager.ShowTurn();
        }

        Unibus.Dispatch<CardDisplay>(CardManager.TURN_ENDED, null);
    }

    public void OnPlayCard(ServerActions.PlayCardAction action)
    {
        this.PlayCard(action.playerId, action.cardId, action.position, action.tapped, action.newHp);
        this.TapCards(action.playerId, action.manaCardsTapped);
    }

    public void OnPlayCardAsMana(ServerActions.PlayCardAsManaAction action)
    {
        var cardTransform = cardIdToCards[action.cardId];
        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        this.playerStacks[action.playerId].manaPool.GetComponent<StackDisplay>().AddCard(cardDisplay);

        if (action.tapped)
        {
            cardDisplay.Tap();
        }

        cardDisplay.FaceDown();
        cardDisplay.SwitchToDefaultZoomView();
    }

    public void OnMoveCard(ServerActions.MoveCardAction action)
    {
        var cardTransform = cardIdToCards[action.cardId];

        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        cardDisplay.CurrentMovingPoints = action.currentMovingPoints;

        boardCreator.MoveUnit(cardDisplay, action.position, action.path);

        Unibus.Dispatch(CardManager.CARD_MOVED, cardDisplay);
    }

    public void OnCardAttacked(ServerActions.CardAttackedAction action)
    {
        foreach (ServerActions.CardChanges card in action.cardChanges)
        {
            var isAttacker = card.id == action.attackerCardId;
            this.CardWasInBattle(card, isAttacker);
        }
    }

    public void OnCardHealed(ServerActions.CardHealedAction action)
    {
        this.CardAfterHealing(action.healerCard);
        var card = this.CardAfterHealing(action.healedCard);

        Unibus.Dispatch<CardDisplay>(CardManager.CARD_HEALED, card);
    }

    public void OnCardUsedManaAbility(ServerActions.CardUsedManaAbilityAction action)
    {
        this.TapCards(action.playerId, new string[] { action.tappedCardId });
        this.UntapCards(action.playerId, action.cardsUntapped);
    }

    public void OnCardAimed(ServerActions.BaseAction action)
    {
        foreach (ServerActions.CardChanges card in action.cardChanges)
        {
            this.ApplyChangesToCard(card);
        }
    }

    public void OnMoveAndAttack(ServerActions.MoveCardAction moveCardAction, ServerActions.CardAttackedAction cardAttackedAction)
    {
        this.OnMoveCard(moveCardAction);
        Utils.Instance.SetTimeout(1200, () => {
            this.OnCardAttacked(cardAttackedAction);
        });
    }

    private void PlayCard(string playerId, string cardId, Point position, bool taped, int newHp)
    {
        var cardTransform = cardIdToCards[cardId];
        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        this.playerStacks[playerId].table.GetComponent<StackDisplay>().AddCard(cardDisplay);

        cardDisplay.CurrentHp = newHp;

        boardCreator.CreateUnit(cardDisplay, position);

        if (taped)
        {
            cardDisplay.Tap();
        }

        cardDisplay.FaceUp();

        Unibus.Dispatch(CardManager.CARD_PLAYED, cardDisplay);
    }

    private CardDisplay CardAfterHealing(ServerActions.CardAfterHealing card)
    {
        var cardTransform = cardIdToCards[card.id];

        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        if (card.isTapped)
        {
            cardDisplay.Tap();
        }

        if (card.newHp != null)
        {
            cardDisplay.CurrentHp = (int)card.newHp;
        }

        if (card.currentMovingPoints != null)
        {
            cardDisplay.CurrentMovingPoints = (int)card.currentMovingPoints;
        }

        return cardDisplay;
    }

    private void DrawCards(string playerId, string[] cardsIds)
    {
        for (int i = 0; i < cardsIds.Length; i++)
        {
            var cardId = cardsIds[i];
            var cardTransform = cardIdToCards[cardId];
            CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

            this.playerStacks[playerId].hand.GetComponent<StackDisplay>().AddCard(cardDisplay);

            if (playerId == GameState.mainPlayerId)
            {
                cardDisplay.FaceUp();
            }
        }
    }

    private void TapCards(string playerId, string[] cardsIds)
    {
        foreach (string cardId in cardsIds)
        {
            var cardTransform = cardIdToCards[cardId];
            cardTransform.GetComponent<CardDisplay>().Tap();
        }
    }

    private void UntapCards(string playerId, string[] cardsIds)
    {
        foreach (string cardId in cardsIds)
        {
            var cardTransform = cardIdToCards[cardId];
            cardTransform.GetComponent<CardDisplay>().Untap();
        }
    }

    private void CardWasInBattle(ServerActions.CardChanges cardChanges, bool isAttacker)
    {
        var cardTransform = cardIdToCards[cardChanges.id];
        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        this.ApplyChangesToCard(cardChanges);

        if (isAttacker)
        {
            Unibus.Dispatch(CardManager.CARD_ATTACKED, cardDisplay);
        }
    }

    private void ApplyChangesToCard(ServerActions.CardChanges cardChanges)
    {
        var cardTransform = cardIdToCards[cardChanges.id];
        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        if (cardChanges.isTapped)
        {
            cardDisplay.Tap();
        }

        // Это не баг, что сразу и тап и антап. Потому что в дальнейшем должна быть анимация тапа, а потом антапа.
        if (cardChanges.isUntapped)
        {
            cardDisplay.Untap();
        }

        if (cardChanges.newHp != null && cardChanges.hpAuraBuffChange != null)
        {
            cardDisplay.ChangeHpByHPAura((int)cardChanges.newHp, (int)cardChanges.hpAuraBuffChange);
        }
        else if (cardChanges.newHp != null)
        {
            cardDisplay.CurrentHp = (int)cardChanges.newHp;
        }

        if (cardChanges.damage != null)
        {
            cardDisplay.Damage = (int)cardChanges.damage;
        }

        if (cardChanges.killed)
        {
            this.KillUnit(cardDisplay);
        }

        if (cardChanges.currentMovingPoints != null)
        {
            cardDisplay.CurrentMovingPoints = (int)cardChanges.currentMovingPoints;
        }

        if (cardChanges.pushedTo != null)
        {
            boardCreator.PushUnit(cardDisplay, cardChanges.pushedTo);
        }

        if (cardChanges.usedInThisTurnBlockAbility != null)
        {
            cardDisplay.UsedInThisTurnBlockAbility = (bool)cardChanges.usedInThisTurnBlockAbility;
        }

        if (cardChanges.usedInThisTurnEvasionAbility != null)
        {
            cardDisplay.UsedInThisTurnEvasionAbility = (bool)cardChanges.usedInThisTurnEvasionAbility;
        }

        if (cardChanges.isPoisoned != null)
        {
            if ((bool)cardChanges.isPoisoned)
            {
                cardDisplay.PoisonedDamage = (int)cardChanges.poisonDamage;
            } else
            {
                cardDisplay.PoisonedDamage = 0;
            }
        }

        if (cardChanges.isDamageCursed != null)
        {
            if ((bool)cardChanges.isDamageCursed)
            {
                cardDisplay.DamageCursedDamage = (int)cardChanges.damageCursedDamageReduction;
            } else
            {
                cardDisplay.DamageCursedDamage = 0;
            }
        }

        if (cardChanges.blockedRangeAbilityInBeginningOfTurn != null)
        {
            cardTransform.GetComponent<CardDisplay>().BlockedInBeginningOfTurn = (bool)cardChanges.blockedRangeAbilityInBeginningOfTurn;
        }

        if (cardChanges.numberOfAiming != null)
        {
            cardTransform.GetComponent<CardDisplay>().NumberOfAiming = (int)cardChanges.numberOfAiming;
        }
    }

    private void KillUnit(CardDisplay cardDisplay)
    {
        cardDisplay.Kill();
        this.playerStacks[cardDisplay.cardData.ownerId].graveyard.GetComponent<StackDisplay>().AddCard(cardDisplay);
        boardCreator.KillUnit(cardDisplay);

        Unibus.Dispatch(CardManager.CARD_DIED, cardDisplay);
    }
}
