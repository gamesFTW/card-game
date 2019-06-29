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

    public bool firstTimeDataRecived = false;

    public Transform CardPrefab;
    public Transform CardPlaceholderPrefab;

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
    private CardsContainer cardsContainer;
    private AudioController audioController;

    public Dictionary<string, Transform> cardIdToCards = new Dictionary<string, Transform>();

    public Dictionary<string, PlayerTransformsStacks> playersTransformsStacks = new Dictionary<string, PlayerTransformsStacks>();

    public void Awake()
    {
        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();
        cardsContainer = this.transform.Find("CardsContainer").GetComponent<CardsContainer>();
        audioController = this.GetComponent<AudioController>();
    }

    public void Start ()
    {
    }

    public async Task CreateCards()
    {
        GameData gameData;
        if (GameState.gameId != null)
        {
            gameData = await ServerApi.GetGame(GameState.gameId);

            GameState.gameId = gameData.game.id;

            if (GameState.isMainPlayerFirstPlayer)
            {
                GameState.mainPlayerId = gameData.game.player1Id;
                GameState.enemyOfMainPlayerId = gameData.game.player2Id;
            } else
            {
                GameState.mainPlayerId = gameData.game.player2Id;
                GameState.enemyOfMainPlayerId = gameData.game.player1Id;
            }

            GameState.playerIdWhoMakesMove = gameData.game.currentPlayersTurn;
        } else
        {
            gameData = await ServerApi.GetLastGame();

            GameState.gameId = gameData.game.id;
            GameState.mainPlayerId = gameData.game.player1Id;
            GameState.enemyOfMainPlayerId = gameData.game.player2Id;

            GameState.playerIdWhoMakesMove = gameData.game.currentPlayersTurn;
        }


        CardData[][] stacksData = this.CreateStacksData(gameData);

        Transform[] stacksTransforms = new Transform[] {
            PlayerDeck, PlayerHand, PlayerManaPool, PlayerTable, PlayerGraveyard,
            OpponentDeck, OpponentHand, OpponentManaPool, OpponentTable, OpponentGraveyard
        };

        List<CardDisplay> cardDisplays = new List<CardDisplay>();

        for (int i = 0; i < stacksTransforms.Length; i++)
        {
            foreach (CardData card in stacksData[i])
            {
                string playerId;
                // Простите меня за такое
                if (i <= 3)
                {
                    playerId = GameState.mainPlayerId;
                } else
                {
                    playerId = GameState.enemyOfMainPlayerId;
                }

                CardDisplay cardDisplay = CreateCardIn(card, playerId, stacksTransforms[i]);
                cardDisplays.Add(cardDisplay);
            }
        }

        this.LoadSounds(cardDisplays);

        if (!firstTimeDataRecived)
        {
            firstTimeDataRecived = true;
            OnGameDataFirstTimeRecived();
        }

        this.CreateAreas(gameData.areas);
    }

    private void CreateAreas(AreaData[] areas)
    {
        foreach (AreaData area in areas)
        {
            boardCreator.CreateArea(area);
        }
    }

    private CardData[][] CreateStacksData(GameData gameData)
    {
        string playerId = GameState.mainPlayerId;

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

    private CardDisplay CreateCardIn(CardData cardData, string playerId, Transform stack)
    {
        Transform newCard = (Transform)Instantiate(CardPrefab, new Vector2(0, 0), new Quaternion());
        Transform newCardPlaceholder = (Transform)Instantiate(CardPlaceholderPrefab, new Vector2(0, 0), new Quaternion());
        cardIdToCards.Add(cardData.id, newCard);

        newCardPlaceholder.SetParent(stack, false);

        CardDisplay cardDisplay = newCard.GetComponent<CardDisplay>();
        cardDisplay.Placeholder = newCardPlaceholder;

        cardsContainer.AddCard(cardDisplay);

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

        if (cardData.hero)
        {
            if (playerId == GameState.mainPlayerId) {
                boardCreator.allyHeroes.Add(cardDisplay);
            }
        }

        return cardDisplay;
    }

    private void OnGameDataFirstTimeRecived()
    {
        GameObject go = GameObject.Find("Canvas");
        SocketIOClient socketClient = go.GetComponent<SocketIOClient>();
        socketClient.StartExchange();
    }

    private void LoadSounds(List<CardDisplay> cardDisplays)
    {
        List<string> urls = new List<string>();

        foreach (var cardDisplay in cardDisplays)
        {
            if (cardDisplay.cardData.sounds != null)
            {
                foreach (KeyValuePair<string, SoundData> entry in cardDisplay.cardData.sounds)
                {
                    SoundData soundData = entry.Value;
                    urls.Add(soundData.url);
                }
            }
        }

        this.audioController.AddSounds(urls);
    }
}
