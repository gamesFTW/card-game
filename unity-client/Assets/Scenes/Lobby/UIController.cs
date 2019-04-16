using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Lobby
{
    public class UIController : MonoBehaviour
    {
        public Button createGameButton;
        public Dropdown player1DeckDropdown;
        public Dropdown player2DeckDropdown;

        public GameObject LobbyGame;

        private List<string> deckIds;

        // Start is called before the first frame update
        async void Start()
        {
            createGameButton.onClick.AddListener(OnCreateGameButtonClick);

            UpdateGames();
            UpdateDropdowns();
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
                GameObject lobbyGame = Instantiate<GameObject>(LobbyGame, lobbyGames);
                lobbyGame.transform.SetParent(lobbyGames.transform);

                LobbyGame lobbyGameComponent = lobbyGame.GetComponent<LobbyGame>();
                lobbyGameComponent.gameId = game.gameServerId;
            }
        }

        private async void OnCreateGameButtonClick()
        {
            string player1DeckId = deckIds[player1DeckDropdown.value];
            string player2DeckId = deckIds[player2DeckDropdown.value];

            await LobbyServerApi.CreateGame(player1DeckId, player2DeckId);

            UpdateGames();
        }
    }
}
