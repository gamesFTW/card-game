using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

public class PlayerTransformsStacks
{
    public Transform deck;
    public Transform hand;
    public Transform manaPool;
    public Transform table;
    public Transform graveyard;
}

public class CardCreator : MonoBehaviour {
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

    private BoardCreator boardCreator;

    public Dictionary<string, Transform> cardIdToCards = new Dictionary<string, Transform>();

    public Dictionary<string, PlayerTransformsStacks> playersTransformsStacks = new Dictionary<string, PlayerTransformsStacks>();

    public void Start ()
    {
        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();
    }

    public async Task CreateCards()
    {
        GameData gameData = await ServerApi.GetGame();

        CardData[][] stacksData = this.CreateStacksData(gameData);

        Transform[] stacksTransforms = new Transform[] {
            PlayerDeck, PlayerHand, PlayerManaPool, PlayerTable, PlayerGraveyard,
            OpponentDeck, OpponentHand, OpponentManaPool, OpponentTable, OpponentGraveyard
        };
        
        for (int i = 0; i < stacksTransforms.Length; i++)
        {
            foreach (CardData card in stacksData[i])
            {
                string playerId;
                // Простите меня за такое
                if (i <= 3)
                {
                    playerId = ServerApi.mainPlayerId;
                } else
                {
                    playerId = ServerApi.enemyOfMainPlayerId;
                }

                CreateCardIn(card, playerId, stacksTransforms[i]);
            }
        }
    }

    private CardData[][] CreateStacksData(GameData gameData)
    {
        string playerId = ServerApi.mainPlayerId;

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

        playersTransformsStacks.Add(player.id, new PlayerTransformsStacks { deck = PlayerDeck, hand = PlayerHand, manaPool = PlayerManaPool, table = PlayerTable, graveyard = PlayerGraveyard });
        playersTransformsStacks.Add(opponent.id, new PlayerTransformsStacks { deck = OpponentDeck, hand = OpponentHand, manaPool = OpponentManaPool, table = OpponentTable, graveyard = OpponentGraveyard });

        return stacksData;
    }

    private void CreateCardIn(CardData cardData, string playerId, Transform stack)
    {
        Transform newCard = (Transform)Instantiate(CardPrefab, new Vector2(0, 0), new Quaternion());
        cardIdToCards.Add(cardData.id, newCard);

        newCard.transform.SetParent(stack, false);

        CardDisplay cardDisplay = newCard.GetComponent<CardDisplay>();

        cardData.ownerId = playerId;
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
            boardCreator.CreateUnit(cardDisplay, new Point(cardData.x, cardData.y));
        }
    }
}
