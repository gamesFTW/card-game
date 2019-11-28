using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

namespace Lobby
{
    public class MainMenu : MonoBehaviour
    {
        void Start()
        {
            var lobbyButton = this.transform.Find("LobbyButton").GetComponent<Button>();
            var singlePlayerButton = this.transform.Find("SinglePlayerButton").GetComponent<Button>();
            var multiPlayerButton = this.transform.Find("MultiPlayerButton").GetComponent<Button>();

            lobbyButton.onClick.AddListener(this.OnLobbyButtonClick);
            singlePlayerButton.onClick.AddListener(this.OnSinglePlayerButtonClick);
            multiPlayerButton.onClick.AddListener(this.OnMultiPlayerButtonClick);
        }

        private void OnLobbyButtonClick()
        {
            SceneManager.LoadScene("Lobby");
        }

        private void OnSinglePlayerButtonClick()
        {
            ChooseDeck.isSinglePlayer = true;
            SceneManager.LoadScene("ChooseDeck");
        }

        private void OnMultiPlayerButtonClick()
        {
            ChooseDeck.isSinglePlayer = false;
            SceneManager.LoadScene("ChooseDeck");
        }
    }
}
