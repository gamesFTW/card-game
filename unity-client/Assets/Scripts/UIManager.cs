using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class UIManager : MonoBehaviour
{
    void Start()
    {
        Button endOfTurnButton = this.transform.Find("UI/EndOfTurn").GetComponent<Button>();
        endOfTurnButton.onClick.AddListener(OnClick);
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("Lobby");
        }
    }

    void OnClick()
    {
        ServerApi.EndOfTurn();
    }
}
