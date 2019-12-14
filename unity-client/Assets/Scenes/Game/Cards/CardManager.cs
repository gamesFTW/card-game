using System.Collections.Generic;
using UnibusEvent;
using UnityEngine;

public class CardManager : MonoBehaviour
{

    private Dictionary<string, Transform> cardIdToCards;
    private Dictionary<string, PlayerTransformsStacks> playerStacks;

    private BoardCreator boardCreator;

    public void Start()
    {
        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();
    }

    public void Init()
    {
        CardCreator cardCreator = this.GetComponent<CardCreator>();

        cardIdToCards = cardCreator.cardIdToCards;
        playerStacks = cardCreator.playersTransformsStacks;
    }

    public void DrawCards(string playerId, string[] cardsIds)
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

    public void TapCards(string playerId, string[] cardsIds)
    {
        foreach (string cardId in cardsIds)
        {
            var cardTransform = cardIdToCards[cardId];
            cardTransform.GetComponent<CardDisplay>().Tap();
        }
    }

    public void UntapCards(string playerId, string[] cardsIds)
    {
        foreach (string cardId in cardsIds)
        {
            var cardTransform = cardIdToCards[cardId];
            cardTransform.GetComponent<CardDisplay>().Untap();
        }
    }

    public void PlayCard(string playerId, string cardId, Point position, bool taped, int newHp)
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

        Unibus.Dispatch(AudioController.CARD_PLAYED, cardDisplay);
    }

    public void PlayCardAsMana(string playerId, string cardId, bool taped)
    {
        var cardTransform = cardIdToCards[cardId];
        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        this.playerStacks[playerId].manaPool.GetComponent<StackDisplay>().AddCard(cardDisplay);

        if (taped)
        {
            cardDisplay.Tap();
        }

        cardDisplay.FaceDown();
        cardDisplay.SwitchToDefaultZoomView();
    }

    public void MoveCard(string playerId, string cardId, Point position, int currentMovingPoints, Point[] path)
    {
        var cardTransform = cardIdToCards[cardId];

        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        cardDisplay.CurrentMovingPoints = currentMovingPoints;

        boardCreator.MoveUnit(cardDisplay, position, path);

        Unibus.Dispatch(AudioController.CARD_MOVED, cardDisplay);
    }

    public void CardAfterHealing(ServerActions.CardAfterHealing card)
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
    }

    public void CardWasInBattle(ServerActions.CardChanges cardChanges, bool isAttacker)
    {
        var cardTransform = cardIdToCards[cardChanges.id];
        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        this.ApplyChangesToCard(cardChanges);

        if (isAttacker)
        {
            Unibus.Dispatch(AudioController.CARD_ATTACKED, cardDisplay);
        }
    }

    public void ApplyChangesToCard(ServerActions.CardChanges cardChanges)
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

        Unibus.Dispatch(AudioController.CARD_DIED, cardDisplay);
    }
}
