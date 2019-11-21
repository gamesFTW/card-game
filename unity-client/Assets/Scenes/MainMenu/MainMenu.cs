using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class MainMenu : MonoBehaviour
{
    void Start()
    {
        var lobbyButton = this.transform.Find("LobbyButton").GetComponent<Button>();

        lobbyButton.onClick.AddListener(this.OnLobbyButtonClick);
    }

    private void OnLobbyButtonClick()
    {
        SceneManager.LoadScene("Lobby");
    }
}
