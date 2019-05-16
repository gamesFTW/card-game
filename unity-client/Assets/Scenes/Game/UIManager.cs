using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnibusEvent;
using LateExe;

public class UIManager : MonoBehaviour
{
    public Text errorText;
    public Text changeTurnText;

    private Executer executer;
    private InvokeId taskId;

    void Start()
    {
        Button endOfTurnButton = this.transform.Find("UI/EndOfTurn").GetComponent<Button>();
        endOfTurnButton.onClick.AddListener(OnClick);

        Unibus.Subscribe<string>(HttpRequest.HTTP_ERROR, OnHttpError);

        this.executer = new Executer(this);

        changeTurnText.GetComponent<CanvasRenderer>().SetAlpha(0);

        Unibus.Subscribe<string>(ReceiverFromServer.TURN_ENDED, OnTurnEnded);
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

    private void OnTurnEnded (string playerId)
    {
        if (GameState.isMainPlayerTurn)
        {
            changeTurnText.text = "Your turn";
        } else
        {
            changeTurnText.text = "Opponent turn";
        }

        var colorToFadeTo = new Color(1f, 1f, 1f, 1);
        changeTurnText.CrossFadeColor(colorToFadeTo, 0.2f, true, true);

        this.taskId = this.executer.DelayExecute(1, x => {
            colorToFadeTo = new Color(1f, 1f, 1f, 0);
            changeTurnText.CrossFadeColor(colorToFadeTo, 0.2f, true, true);
        });
    }
}
