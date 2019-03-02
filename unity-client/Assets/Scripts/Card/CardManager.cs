using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CardManager : MonoBehaviour
{
    private Dictionary<string, Transform> cardIdToCards;
    private Dictionary<string, PlayerStacks> playerStacks;

    public async void Start()
    {
        CardCreator cardCreator = this.GetComponent<CardCreator>();
        await cardCreator.CreateCards();

        cardIdToCards = cardCreator.cardIdToCards;
        playerStacks = cardCreator.playerStacks;
    }

    public void DrawCards(string playerId, string[] cardsIds)
    {
        for (int i = 0; i < cardsIds.Length; i++)
        {
            var cardId = cardsIds[i];
            var cardTransform = cardIdToCards[cardId];

            cardTransform.SetParent(this.playerStacks[playerId].hand, false);

            if (playerId == ServerApi.currentPlayerId)
            {
                cardTransform.GetComponent<CardDisplay>().FaceUp();
            }
        }
    }

    public void UntapCards(string playerId, string[] cardsIds)
    {
        for (int i = 0; i < cardsIds.Length; i++)
        {
            var cardId = cardsIds[i];
            var cardTransform = cardIdToCards[cardId];

            cardTransform.GetComponent<CardDisplay>().Untap();
        }
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
}
