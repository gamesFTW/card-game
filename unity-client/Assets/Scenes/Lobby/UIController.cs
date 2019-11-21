using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnibusEvent;
using UnityEngine.SceneManagement;

namespace Lobby
{
    public class UIController : MonoBehaviour
    {
        public Button createGameButton;
        public Dropdown player1DeckDropdown;
        public Dropdown player2DeckDropdown;

        public GameObject lobbyGame;

        private List<string> deckIds;

        // Start is called before the first frame update
        async void Start()
        {
            var mainMenuButton = this.transform.Find("MainMenuButton").GetComponent<Button>();
            mainMenuButton.onClick.AddListener(this.OnMainMenuButtonClick);

            createGameButton.onClick.AddListener(OnCreateGameButtonClick);

            UpdateGames();
            UpdateDropdowns();

            Unibus.Subscribe<LobbyGame>(LobbyGame.DETELE_GAME, OnDeleteGameHandler);
        }

        // Update is called once per frame
        void Update()
        {

        }

        private async void UpdateDropdowns()
        {
            DecksData decksData = await LobbyServerApi.GetDecks<DecksData>();

            List<Dropdown.OptionData> options = new List<Dropdown.OptionData>();
            deckIds = new List<string>();

            foreach (DeckData deck in decksData.Decks)
            {
                deckIds.Add(deck._id);

                Dropdown.OptionData option = new Dropdown.OptionData();
                option.text = deck.name;
                options.Add(option);
            }

            player1DeckDropdown.ClearOptions();
            player1DeckDropdown.AddOptions(options);

            player2DeckDropdown.ClearOptions();
            player2DeckDropdown.AddOptions(options);
        }

        private async void UpdateGames()
        {
            var lobbyGames = this.transform.Find("LobbyGames");

            foreach (Transform child in lobbyGames)
            {
                GameObject.Destroy(child.gameObject);
            }

            GamesData gamesData = await LobbyServerApi.GetGames<GamesData>();

            foreach (GameData game in gamesData.Games)
            {
                GameObject lobbyGame = Instantiate<GameObject>(this.lobbyGame, lobbyGames);
                lobbyGame.transform.SetParent(lobbyGames.transform);

                LobbyGame lobbyGameComponent = lobbyGame.GetComponent<LobbyGame>();

                lobbyGameComponent.lobbyGameId = game._id;
                lobbyGameComponent.gameServerId = game.gameServerId;
                lobbyGameComponent.deckName1 = game.deckName1;
                lobbyGameComponent.deckName2 = game.deckName2;
            }
        }

        private async void OnCreateGameButtonClick()
        {
            string player1DeckId = deckIds[player1DeckDropdown.value];
            string player2DeckId = deckIds[player2DeckDropdown.value];

            await LobbyServerApi.CreateGame(player1DeckId, player2DeckId);

            UpdateGames();
        }

        private async void OnDeleteGameHandler(LobbyGame lobbyGame)
        {
            await LobbyServerApi.DeleteGame(lobbyGame.lobbyGameId);

            UpdateGames();
        }

        private void OnMainMenuButtonClick()
        {
            SceneManager.LoadScene("MainMenu");
        }
    }
}
