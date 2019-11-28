using UnityEngine.UI;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Lobby
{
    public class FindingOpponent : MonoBehaviour
    {
        public static string deckId;

        void Start()
        {
            var backButton = this.transform.Find("BackButton").GetComponent<Button>();

            backButton.onClick.AddListener(this.OnBackButtonClick);
        }

        private void OnBackButtonClick()
        {
            SceneManager.LoadScene("ChooseDeck");
        }
    }
}
