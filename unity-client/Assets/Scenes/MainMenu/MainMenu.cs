using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class MainMenu : MonoBehaviour
{
    void Start()
    {
        var lobbyButton = this.transform.Find("LobbyButton").GetComponent<Button>();
        var singlePlayerButton = this.transform.Find("SinglePlayerButton").GetComponent<Button>();

        lobbyButton.onClick.AddListener(this.OnLobbyButtonClick);
        singlePlayerButton.onClick.AddListener(this.OnSinglePlayerButtonClick);
    }

    private void OnLobbyButtonClick()
    {
        SceneManager.LoadScene("Lobby");
    }

    private void OnSinglePlayerButtonClick()
    {
        SceneManager.LoadScene("ChooseDeck");
    }
}
