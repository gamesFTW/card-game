using UnityEngine.UI;
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;

namespace Lobby
{
    public class FindingOpponent : MonoBehaviour
    {
        public static string deckId;

        async void Start()
        {
            var backButton = this.transform.Find("BackButton").GetComponent<Button>();

            backButton.onClick.AddListener(this.OnBackButtonClick);

            var response = await LobbyServerApi.FindOpponent(deckId);

            if (response.gameFound)
            {
                Main.StartGame(response.gameId, response.playerId, response.opponentId);
            } else
            {
                this.transform.Find("FindingOpponent").GetComponent<TextMeshProUGUI>().text = "Game not found";
            }
        }

        private void OnBackButtonClick()
        {
            SceneManager.LoadScene("ChooseDeck");
        }
    }
}
