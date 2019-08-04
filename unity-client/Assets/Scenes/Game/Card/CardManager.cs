using System.Collections.Generic;
using UnibusEvent;
using UnityEngine;

public class CardManager : MonoBehaviour
{

    private Dictionary<string, Transform> cardIdToCards;
    private Dictionary<string, PlayerTransformsStacks> playerStacks;

    private BoardCreator boardCreator;

    public async void Start()
    {
        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();

        CardCreator cardCreator = this.GetComponent<CardCreator>();
        await cardCreator.CreateCards();

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

            cardDisplay.Placeholder.SetParent(this.playerStacks[playerId].hand, false);

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

    public void HealCards(string playerId, ServerActions.CardHealed[] cardsHealed)
    {
        foreach (ServerActions.CardHealed cardHealed in cardsHealed)
        {
            var cardId = cardHealed.id;
            var cardTransform = cardIdToCards[cardId];
            cardTransform.GetComponent<CardDisplay>().CurrentHp = cardHealed.newHp;
        }
    }

    public void UpdateMovingPoints(ServerActions.MovingPoints[] movingPoints)
    {
        foreach (ServerActions.MovingPoints movingPoint in movingPoints)
        {
            var cardId = movingPoint.id;
            var cardTransform = cardIdToCards[cardId];
            cardTransform.GetComponent<CardDisplay>().CurrentMovingPoints = movingPoint.currentMovingPoints;
        }
    }

    public void UpdateBlockAbility(ServerActions.BlockAbilityUpdate[] blockAbilitiesUpdates)
    {
        foreach (ServerActions.BlockAbilityUpdate blockAbilityUpdate in blockAbilitiesUpdates)
        {
            var cardId = blockAbilityUpdate.id;
            var cardTransform = cardIdToCards[cardId];
            cardTransform.GetComponent<CardDisplay>().UsedInThisTurnBlockAbility = blockAbilityUpdate.usedInThisTurn;
        }
    }

    public void UpdateEvasionAbility(ServerActions.EvasionAbilityUpdate[] evasionAbilitiesUpdates)
    {
        foreach (ServerActions.EvasionAbilityUpdate evasionAbilityUpdate in evasionAbilitiesUpdates)
        {
            var cardId = evasionAbilityUpdate.id;
            var cardTransform = cardIdToCards[cardId];
            cardTransform.GetComponent<CardDisplay>().UsedInThisTurnEvasionAbility = evasionAbilityUpdate.usedInThisTurn;
        }
    }

    public void PlayCard(string playerId, string cardId, Point position, bool taped, int newHp)
    {
        var cardTransform = cardIdToCards[cardId];
        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        cardDisplay.Placeholder.SetParent(this.playerStacks[playerId].table, false);

        if (taped)
        {
            cardDisplay.Tap();
        }

        cardDisplay.FaceUp();

        cardDisplay.CurrentHp = newHp;

        boardCreator.CreateUnit(cardDisplay, position);

        Unibus.Dispatch(AudioController.CARD_PLAYED, cardDisplay);
    }

    public void PlayCardAsMana(string playerId, string cardId, bool taped)
    {
        var cardTransform = cardIdToCards[cardId];
        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        cardDisplay.Placeholder.SetParent(this.playerStacks[playerId].manaPool, false);

        if (taped)
        {
            cardDisplay.Tap();
        }

        cardDisplay.FaceDown();
        cardDisplay.ZoomOut();
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

    public void CardWasInBattle(ServerActions.CardAfterBattle cardChanges, bool isAttacker)
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

        if (cardChanges.newHp != null)
        {
            cardDisplay.CurrentHp = (int)cardChanges.newHp;
        }

        if (cardChanges.killed)
        {
            KillUnit(cardDisplay);
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

        if (isAttacker)
        {
            Unibus.Dispatch(AudioController.CARD_ATTACKED, cardDisplay);
        }
    }

    private void KillUnit(CardDisplay cardDisplay)
    {
        cardDisplay.Kill();
        cardDisplay.Placeholder.SetParent(this.playerStacks[cardDisplay.cardData.ownerId].graveyard, false);
        boardCreator.KillUnit(cardDisplay);

        Unibus.Dispatch(AudioController.CARD_DIED, cardDisplay);
    }
}
