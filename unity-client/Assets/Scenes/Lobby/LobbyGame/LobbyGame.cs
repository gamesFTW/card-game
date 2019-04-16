using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class LobbyGame : MonoBehaviour
{
    public InputField gameIdText;
    public Button playAs1PlayerButton;
    public Button playAs2PlayerButton;

    public string gameId;

    // Start is called before the first frame update
    void Start()
    {
        gameIdText.text = gameId;

        playAs1PlayerButton.onClick.AddListener(OnPlayAs1PlayerButtonClick);
        playAs2PlayerButton.onClick.AddListener(OnPlayAs2PlayerButtonClick);
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    private void OnPlayAs1PlayerButtonClick()
    {
        GameState.gameId = gameId;
        GameState.isMainPlayerFirstPlayer = true;
        SceneManager.LoadScene("Game");
    }

    private void OnPlayAs2PlayerButtonClick()
    {
        GameState.gameId = gameId;
        GameState.isMainPlayerFirstPlayer = false;
        SceneManager.LoadScene("Game");
    }
}
