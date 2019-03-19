using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnibusEvent;

public class CardManager : MonoBehaviour
{
    private Dictionary<string, Transform> cardIdToCards;
    private Dictionary<string, PlayerTransformsStacks> playerStacks;

    private BoardCreator boardCreator;

    private CardDisplay highlightedCard; 

    public async void Start()
    {
        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();

        CardCreator cardCreator = this.GetComponent<CardCreator>();
        await cardCreator.CreateCards();

        cardIdToCards = cardCreator.cardIdToCards;
        playerStacks = cardCreator.playersTransformsStacks;


        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSEOVER_ON_BOARD, OnUnitBoardMouseOver);
        Unibus.Subscribe<Point>(BoardCreator.MOUSEOVER_ON_VOID_TILE, OnVoidBoardMouseOver);
    }

    public void DrawCards(string playerId, string[] cardsIds)
    {
        for (int i = 0; i < cardsIds.Length; i++)
        {
            var cardId = cardsIds[i];
            var cardTransform = cardIdToCards[cardId];

            cardTransform.SetParent(this.playerStacks[playerId].hand, false);

            if (playerId == ServerApi.mainPlayerId)
            {
                cardTransform.GetComponent<CardDisplay>().FaceUp();
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

        cardTransform.SetParent(this.playerStacks[playerId].table, false);

        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        if (taped)
        {
            cardDisplay.Tap();
        }

        cardDisplay.FaceUp();

        cardDisplay.CurrentHp = newHp;

        boardCreator.CreateUnit(cardDisplay, position);
    }

    public void PlayCardAsMana(string playerId, string cardId, bool taped)
    {
        var cardTransform = cardIdToCards[cardId];

        cardTransform.SetParent(this.playerStacks[playerId].manaPool, false);

        if (taped)
        {
            cardTransform.GetComponent<CardDisplay>().Tap();
        }

        cardTransform.GetComponent<CardDisplay>().FaceDown();
    }

    public void MoveCard(string playerId, string cardId, Point position, int currentMovingPoints)
    {
        var cardTransform = cardIdToCards[cardId];

        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        boardCreator.MoveUnit(cardDisplay, position);
    }

    public void CardWasInBattle(ServerActions.CardAfterBattle card)
    {
        var cardTransform = cardIdToCards[card.id];

        CardDisplay cardDisplay = cardTransform.GetComponent<CardDisplay>();

        if (card.isTapped)
        {
            cardDisplay.Tap();
        }

        cardDisplay.CurrentHp = card.newHp;

        if (card.killed)
        {
            cardTransform.SetParent(this.playerStacks[cardDisplay.cardData.ownerId].graveyard, false);
            boardCreator.KillUnit(cardDisplay);
        }
    }



    private void highlightCard(CardDisplay card)
    {
        card.highlightOn();
        if (card != highlightedCard)
        {
            unHighlightCard();
        }

        highlightedCard = card;
    }

    private void unHighlightCard()
    {
        if (highlightedCard)
        {
            highlightedCard.highlightOff();
            highlightedCard = null;
        }
    }

    private void OnUnitBoardMouseOver(UnitDisplay unit)
    {
        CardDisplay card = cardIdToCards[unit.CardData.id].GetComponent<CardDisplay>();
        highlightCard(card);
    }

    private void OnVoidBoardMouseOver(Point point)
    {
        unHighlightCard();
    }
}
