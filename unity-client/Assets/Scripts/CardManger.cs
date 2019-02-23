using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

class PlayerStacks
{
    public Transform deck;
    public Transform hand;
    public Transform manaPool;
    public Transform table;
    public Transform graveyard;
}

public class CardManger : MonoBehaviour {
    public Transform CardPrefab;

    public Transform PlayerDeck;
    public Transform PlayerHand;
    public Transform PlayerManaPool;
    public Transform PlayerTable;
    public Transform PlayerGraveyard;

    public Transform OpponentDeck;
    public Transform OpponentHand;
    public Transform OpponentManaPool;
    public Transform OpponentTable;
    public Transform OpponentGraveyard;

    private string currentPlayerId;

    private BoardController boardController;

    private Dictionary<string, Transform> cardIdToCards = new Dictionary<string, Transform>();

    private Dictionary<string, PlayerStacks> playerStacks = new Dictionary<string, PlayerStacks>();

    public async void Start ()
    {
        boardController = this.transform.Find("Board").GetComponent<BoardController>();

        GameData gameData = await ServerApi.GetGame();

        this.CreateCards(gameData);
    }

    public void DrawCards(string playerId, string[] cardsIds)
    {
        for (int i = 0; i < cardsIds.Length; i++)
        {
            var cardId = cardsIds[i];
           
            var cardTransform = cardIdToCards[cardId];

            cardTransform.SetParent(this.playerStacks[playerId].hand, false);
            cardTransform.GetComponent<CardDisplay>().FaceUp();
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

    private void CreateCards(GameData gameData)
    {
        CardData[][] stacksData = this.CreateStacksData(gameData);

        Transform[] stacksTransforms = new Transform[] {
            PlayerDeck, PlayerHand, PlayerManaPool, PlayerTable, PlayerGraveyard,
            OpponentDeck, OpponentHand, OpponentManaPool, OpponentTable, OpponentGraveyard
        };
        
        for (int i = 0; i < stacksTransforms.Length; i++)
        {
            foreach (CardData card in stacksData[i])
            {
                CreateCardIn(card, stacksTransforms[i]);
            }
        }
    }

    private CardData[][] CreateStacksData(GameData gameData)
    {
        string playerId = ServerApi.currentPlayerId;

        PlayerData player;
        PlayerData opponent;

        if (gameData.player1.id == playerId)
        {
            player = gameData.player1;
            opponent = gameData.player2;
        }
        else
        {
            player = gameData.player2;
            opponent = gameData.player1;
        }

        CardData[][] stacksData = new CardData[][] {
            player.deck, player.hand, player.manaPool, player.table, player.graveyard,
            opponent.deck, opponent.hand, opponent.manaPool, opponent.table, opponent.graveyard,
        };

        playerStacks.Add(player.id, new PlayerStacks { deck = PlayerDeck, hand = PlayerHand, manaPool = PlayerManaPool, table = PlayerTable, graveyard = PlayerGraveyard });
        playerStacks.Add(opponent.id, new PlayerStacks { deck = OpponentDeck, hand = OpponentHand, manaPool = OpponentManaPool, table = OpponentTable, graveyard = OpponentGraveyard });

        return stacksData;
    }

    private void CreateCardIn(CardData cardData, Transform stack)
    {
        Transform newCard = (Transform)Instantiate(CardPrefab, new Vector2(0, 0), new Quaternion());
        cardIdToCards.Add(cardData.id, newCard);

        newCard.transform.SetParent(stack, false);

        CardDisplay cardDisplay = newCard.GetComponent<CardDisplay>();

        cardDisplay.cardData = cardData;

        if (stack.GetComponent<StackDisplay>().IsFaceUp)
        {
            cardDisplay.FaceUp();
        } else
        {
            cardDisplay.FaceDown();
        }

        if (cardData.tapped)
        {
            cardDisplay.Tap();
        }

        if (cardData.alive)
        {
            boardController.CreateUnit(cardData);
        }
    }
}
