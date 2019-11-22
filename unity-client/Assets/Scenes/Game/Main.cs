using System.Collections.Generic;
using UnityEngine;
using System.Threading.Tasks;
using UnibusEvent;


public class Main : MonoBehaviour
{
    public static readonly string GAME_BUILDED = "GAME_BUILDED";

    private AudioController audioController;

    async Task Start()
    {
        audioController = this.GetComponent<AudioController>();

        var gameData = await LoadGame();

        CardCreator cardCreator = this.GetComponent<CardCreator>();
        List<CardDisplay> cardDisplays = cardCreator.CreateCards(gameData);

        this.LoadSounds(cardDisplays);

        CardManager cardManager = this.GetComponent<CardManager>();
        cardManager.Init();

        this.OnGameDataFirstTimeRecived();

        Unibus.Dispatch<string>(Main.GAME_BUILDED, "");
    }

    private async Task<GameData> LoadGame()
    {
        GameData gameData;
        if (GameState.gameId != null)
        {
            gameData = await ServerApi.GetGame(GameState.gameId);

            GameState.gameId = gameData.game.id;

            if (GameState.mainPlayerId == null && GameState.enemyOfMainPlayerId == null)
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
