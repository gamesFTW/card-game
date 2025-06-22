using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using Cysharp.Threading.Tasks;

public class Main : MonoBehaviour
{
    public GoogleAnalyticsV4 googleAnalytics;

    private AudioController audioController;
    private UIManager uiManager;
    private WebSocketClient webSocketClient;

    public static void StartGame(string gameId, string playerId, string opponentId)
    {
        GameState.gameId = gameId;
        GameState.mainPlayerId = playerId;
        GameState.enemyOfMainPlayerId = opponentId;
        GameState.tutorial = false;

        SceneManager.LoadScene("Game");
    }

    public static void StartTutorialGame(string gameId, string playerId, string opponentId)
    {
        GameState.gameId = gameId;
        GameState.mainPlayerId = playerId;
        GameState.enemyOfMainPlayerId = opponentId;
        GameState.tutorial = true;

        SceneManager.LoadScene("Game");
    }

    public static void StartGameAsFirstPlayer(string gameId)
    {
        GameState.gameId = gameId;
        GameState.isMainPlayerFirstPlayer = true;
        GameState.tutorial = false;

        SceneManager.LoadScene("Game");
    }

    public static void StartGameAsSecondPlayer(string gameId)
    {
        GameState.gameId = gameId;
        GameState.isMainPlayerFirstPlayer = false;
        GameState.tutorial = false;

        SceneManager.LoadScene("Game");
    }

    async void Awake()
    {
        this.audioController = this.GetComponent<AudioController>();
        this.uiManager = this.GetComponent<UIManager>();
    }

    async UniTask Start()
    {
        // googleAnalytics.LogScreen("Game");

        // TODO Добавить GameType и LobbyDeckId
        // googleAnalytics.LogEvent(
        //     new EventHitBuilder()
        //     .SetEventCategory(AnalyticsEventsCategory.Game)
        //     .SetEventAction(AnalyticsEvents.EnteredTheGame)
        //     .SetCustomDimension(AnalyticsDemention.GameId, GameState.gameId)
        //     .SetCustomDimension(AnalyticsDemention.PlayerId, GameState.mainPlayerId)
        // );

        var gameData = await LoadGame();

        CardCreator cardCreator = this.GetComponent<CardCreator>();

        List<CardDisplay> cardDisplays = cardCreator.CreateCards(gameData);
        LoadSounds(cardDisplays);

        CardManager cardManager = this.GetComponent<CardManager>();
        cardManager.Init();

        GameObject webSocketClientGameObject = GameObject.Find("WebSocketClient");
        webSocketClient = webSocketClientGameObject.GetComponent<WebSocketClient>();

        if (webSocketClient.connected)
        {
            ReceiverFromServer receiverFromServer = this.GetComponent<ReceiverFromServer>();
            webSocketClient.RegisterClient(receiverFromServer);
        }
        else
        {
            webSocketClient.OnConnected += OnWebSocketClientConnectedHandler;
        }

        CursorController.SetDefault();

        if (GameState.gameData.game.gameEnded)
        {
            this.uiManager.ShowWinStatus();
        }
        else
        {
            this.uiManager.ShowTurn();
        }
    }

    private async UniTask<GameData> LoadGame()
    {
        GameData gameData;
        if (GameState.gameId != null)
        {
            gameData = await ServerApi.GetGame(GameState.gameId);

            GameState.gameId = gameData.game.id;

            if (GameState.mainPlayerId == "" && GameState.enemyOfMainPlayerId == "")
            {
                if (GameState.isMainPlayerFirstPlayer)
                {
                    GameState.mainPlayerId = gameData.game.player1Id;
                    GameState.enemyOfMainPlayerId = gameData.game.player2Id;
                }
                else
                {
                    GameState.mainPlayerId = gameData.game.player2Id;
                    GameState.enemyOfMainPlayerId = gameData.game.player1Id;
                }
            } else
            {
                GameState.isMainPlayerFirstPlayer = gameData.player1.id == GameState.mainPlayerId;
            }

            GameState.playerIdWhoMakesMove = gameData.game.currentPlayersTurn;
        }
        else
        {
            gameData = await ServerApi.GetLastGame();

            GameState.gameId = gameData.game.id;
            GameState.mainPlayerId = gameData.game.player1Id;
            GameState.enemyOfMainPlayerId = gameData.game.player2Id;

            GameState.playerIdWhoMakesMove = gameData.game.currentPlayersTurn;
        }

        GameState.gameData = gameData;

        return gameData;
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

    private void OnWebSocketClientConnectedHandler()
    {
        ReceiverFromServer receiverFromServer = this.GetComponent<ReceiverFromServer>();
        webSocketClient.RegisterClient(receiverFromServer);
        webSocketClient.OnConnected -= OnWebSocketClientConnectedHandler;
    }
}
