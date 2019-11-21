using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnibusEvent;

public class LobbyGame : MonoBehaviour
{
    public static readonly string DETELE_GAME = "DETELE_GAME";

    public Text decksNames;
    public InputField lobbyGameIdText;
    public InputField gameServerIdText;
    public Button playAs1PlayerButton;
    public Button playAs2PlayerButton;

    public Button deleteGameButton;

    public string lobbyGameId;
    public string gameServerId;
    public string deckName1;
    public string deckName2;

    // Start is called before the first frame update
    void Start()
    {
        lobbyGameIdText.text = lobbyGameId;
        gameServerIdText.text = gameServerId;
        decksNames.text = deckName1 + " vs " + deckName2;

        playAs1PlayerButton.onClick.AddListener(OnPlayAs1PlayerButtonClick);
        playAs2PlayerButton.onClick.AddListener(OnPlayAs2PlayerButtonClick);

        deleteGameButton.onClick.AddListener(OnDeleteGameButtonClick);
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    private void OnPlayAs1PlayerButtonClick()
    {
        GameState.gameId = gameServerId;
        GameState.isMainPlayerFirstPlayer = true;
        SceneManager.LoadScene("Game");
    }

    private void OnPlayAs2PlayerButtonClick()
    {
        GameState.gameId = gameServerId;
        GameState.isMainPlayerFirstPlayer = false;
        SceneManager.LoadScene("Game");
    }

    private void OnDeleteGameButtonClick()
    {
        Unibus.Dispatch(DETELE_GAME, this);
    }
}
