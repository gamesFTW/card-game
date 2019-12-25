using System.Collections.Generic;
using UnityEngine;
using System.Threading.Tasks;
using UnityEngine.SceneManagement;


public class Main : MonoBehaviour
{
    private AudioController audioController;
    private UIManager uiManager;

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

    async Task Start()
    {
        var gameData = await LoadGame();

        CardCreator cardCreator = this.GetComponent<CardCreator>();

        List<CardDisplay> cardDisplays = cardCreator.CreateCards(gameData);
        this.LoadSounds(cardDisplays);

        CardManager cardManager = this.GetComponent<CardManager>();
        cardManager.Init();

        this.OnGameDataFirstTimeRecived();

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

    private async Task<GameData> LoadGame()
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

    private void OnGameDataFirstTimeRecived()
    {
        GameObject go = GameObject.Find("Canvas");
        SocketIOClient socketClient = go.GetComponent<SocketIOClient>();
        socketClient.StartExchange();
    }
}
