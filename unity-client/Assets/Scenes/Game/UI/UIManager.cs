using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnibusEvent;
using LateExe;
using DG.Tweening;

public class UIManager : MonoBehaviour
{
    public Text errorText;
    public GameObject changeTurn;
    public Text changeTurnText;

    private Executer executer;
    private InvokeId taskId;

    void Start()
    {
        Button endOfTurnButton = this.transform.Find("UI/EndOfTurn").GetComponent<Button>();
        endOfTurnButton.onClick.AddListener(this.OnEndOfTurnButtonClick);

        Unibus.Subscribe<string>(HttpRequest.HTTP_ERROR, OnHttpError);

        this.executer = new Executer(this);

        this.changeTurn.GetComponent<CanvasGroup>().DOFade(0, 0);

        Unibus.Subscribe<string>(ReceiverFromServer.TURN_ENDED, OnTurnEnded);
        Unibus.Subscribe<string>(Main.GAME_BUILDED, OnGameBuilded);
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.F1))
        {
            SceneManager.LoadScene("Lobby");
        }

        if (Input.GetKeyDown(KeyCode.F12))
        {
            ServerApi.EndOfTurn();
        }
    }

    void OnEndOfTurnButtonClick()
    {
        if (GameState.isMainPlayerTurn)
        {
            var voidManaSlots = ManaPool.playerInstance.GetVoidManaSlots();
            if (voidManaSlots < 3)
            {
                Dialog.instance.ShowDialog(
                    $"You need convert {3 - voidManaSlots} card to mana slots, or you lose {3 - voidManaSlots} mana",
                    "End turn anyway",
                    this.OnEndTurnAnywayButtonClick,
                    "Cancel",
                    this.OnContinueTurnButtonClick
                );
            } else
            {
                ServerApi.EndOfTurn();
            }
            
        }
    }

    void OnEndTurnAnywayButtonClick()
    {
        ServerApi.EndOfTurn();
        Dialog.instance.HideDialog();
    }

    void OnContinueTurnButtonClick()
    {
        Dialog.instance.HideDialog();
    }

    void OnEndOfTurnPointerEnter()
    {
        Button endOfTurnButton = this.transform.Find("UI/EndOfTurn").GetComponent<Button>();
        //endOfTurnButton.transform.DOScale(endOfTurnButton.transform.localScale, 0,3f);
    }

    private void OnHttpError(string errorMessage)
    {
        if (!(this.taskId is null))
        {
            this.executer.StopExecute(this.taskId);
        }

        errorText.text = errorMessage;

        errorText.GetComponent<CanvasRenderer>().SetAlpha(0);

        var colorToFadeTo = new Color(1f, 1f, 1f, 1);
        errorText.CrossFadeColor(colorToFadeTo, 0.2f, true, true);

        this.taskId = this.executer.DelayExecute(10, x => {
            colorToFadeTo = new Color(1f, 1f, 1f, 0);
            errorText.CrossFadeColor(colorToFadeTo, 0.2f, true, true);
        });
    }

    private void OnGameBuilded(string _)
    {
        ShowTurn();
    }

    private void OnTurnEnded (string _)
    {
        ShowTurn();
    }

    private void ShowTurn()
    {
        GameObject endOfTurnButtonSelectedGlow = this.transform.Find("UI/EndOfTurn/Selected").gameObject;

        if (GameState.isMainPlayerTurn)
        {
            changeTurnText.text = "Your turn";
            endOfTurnButtonSelectedGlow.SetActive(true);
        }
        else
        {
            changeTurnText.text = "Opponent turn";
            endOfTurnButtonSelectedGlow.SetActive(false);
        }

        var colorToFadeTo = new Color(1f, 1f, 1f, 1);
        this.changeTurn.GetComponent<CanvasGroup>().DOFade(1, 0.5f);

        this.executer.DelayExecute(1, x => {
            colorToFadeTo = new Color(1f, 1f, 1f, 0);
            this.changeTurn.GetComponent<CanvasGroup>().DOFade(0, 0.5f);
        });
    }
}
