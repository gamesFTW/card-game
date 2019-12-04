using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class GameMenu : MonoBehaviour
{
    private bool menuVisible = false;

    private void Start()
    {
        this.transform.Find("Container/MainMenu").GetComponent<Button>().onClick.AddListener(this.OnMainMenuClick);
        this.transform.Find("Container/Resume").GetComponent<Button>().onClick.AddListener(this.OnResumeClick);
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            if (this.menuVisible)
            {
                this.HideMenu();
            } else
            {
                this.ShowMenu();
            }
        }
    }

    private void ShowMenu()
    {
        this.transform.Find("Container").gameObject.SetActive(true);
        this.menuVisible = true;
    }

    private void HideMenu()
    {
        this.transform.Find("Container").gameObject.SetActive(false);
        this.menuVisible = false;
    }

    private void OnMainMenuClick()
    {
        SceneManager.LoadScene("MainMenu");
    }

    private void OnResumeClick()
    {
        this.HideMenu();
    }
}
