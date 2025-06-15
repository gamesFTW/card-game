using UnityEngine.UI;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Lobby
{
    public class ChooseDeck : MonoBehaviour
    {
        public GoogleAnalyticsV4 googleAnalytics;

        public static bool isSinglePlayer = false;

        async void Start()
        {
            // googleAnalytics.LogScreen("Choose deck");

            DecksData decksData = await LobbyServerApi.GetPlayerDecks<DecksData>();

            foreach (DeckData deck in decksData.Decks)
            {
                var deckButton = this.CreateButton();
                deckButton.transform.Find("Text").GetComponent<Text>().text = deck.name;
                deckButton.GetComponent<ButtonValue>().value = deck._id;

                deckButton.GetComponent<Button>().onClick.AddListener(() => this.OnButtonClick(deckButton));
            }

            var backButton = this.CreateButton();
            backButton.transform.Find("Text").GetComponent<Text>().text = "Main menu";
            backButton.GetComponent<Button>().onClick.AddListener(this.OnBackButtonClick);
        }

        private GameObject CreateButton()
        {
            var decks = this.transform.Find("Decs");
            GameObject deckButtonPrefab = Resources.Load<GameObject>("MenuButton");
            GameObject deckButton = Instantiate<GameObject>(deckButtonPrefab, decks.transform);

            deckButton.transform.SetParent(decks, false);
            return deckButton;
        }

        private async void OnButtonClick(GameObject deckButton)
        {
            var value = deckButton.GetComponent<ButtonValue>().value;

            if (ChooseDeck.isSinglePlayer)
            {
                this.transform.Find("Decs").gameObject.SetActive(false);
                SinglePlayerGameData data = await LobbyServerApi.CreateSinglePlayerGame(value);

                Main.StartGame(data.gameServerId, data.playerId, data.aiId);
            } else
            {
                FindingOpponent.deckId = value;
                SceneManager.LoadScene("FindingOpponent");
            }
        }

        private void OnBackButtonClick()
        {
            SceneManager.LoadScene("MainMenu");
        }
    }
}
