using UnityEngine;
using TMPro;
using UnityEngine.UI;
using UnityEngine.Events;
using UnibusEvent;

public class Dialog : MonoBehaviour
{
    public static string DIALOG_MOUSE_ENTER = "DIALOG_MOUSE_ENTER";
    public static string DIALOG_MOUSE_EXIT = "DIALOG_MOUSE_EXIT";

    public static Dialog instance;

    private GameObject dialog;
    private GameObject button1;
    private GameObject button2;
    private TMPro.TextMeshProUGUI dialogText;

    private UnityAction button1ClickHandler;
    private UnityAction button2ClickHandler;

    void Awake()
    {
        Dialog.instance = this;
        this.button1 = this.transform.Find("ButtonContainer").Find("Button1").gameObject;
        this.button2 = this.transform.Find("ButtonContainer").Find("Button2").gameObject;

        this.gameObject.SetActive(false);
    }

    public void ShowDialog(string dialogText, string buttonText, UnityAction buttonClickHandler)
    {
        this.gameObject.SetActive(true);
        this.button2.SetActive(false);

        this.transform.Find("DialogText").GetComponent<TextMeshProUGUI>().text = dialogText;
        this.button1.transform.Find("Text").GetComponent<Text>().text = buttonText;

        this.button1ClickHandler = buttonClickHandler;

        this.button1.GetComponent<Button>().onClick.AddListener(OnButton1ClickHandler);
    }

    public void ShowDialog(string dialogText, string button1Text, UnityAction button1ClickHandler, string button2Text, UnityAction button2ClickHandler)
    {
        this.gameObject.SetActive(true);
        this.button2.SetActive(true);

        this.transform.Find("DialogText").GetComponent<TextMeshProUGUI>().text = dialogText;
        this.button1.transform.Find("Text").GetComponent<Text>().text = button1Text;
        this.button2.transform.Find("Text").GetComponent<Text>().text = button2Text;

        this.button1ClickHandler = button1ClickHandler;
        this.button2ClickHandler = button2ClickHandler;

        this.button1.GetComponent<Button>().onClick.AddListener(OnButton1ClickHandler);
        this.button2.GetComponent<Button>().onClick.AddListener(OnButton2ClickHandler);
    }

    public void HideDialog()
    {
        this.gameObject.SetActive(false);

        this.button1.GetComponent<Button>().onClick.RemoveListener(OnButton1ClickHandler);
        this.button2.GetComponent<Button>().onClick.RemoveListener(OnButton2ClickHandler);
        Unibus.Dispatch(DIALOG_MOUSE_EXIT, "");
    }

    private void OnMouseEnter()
    {
        Unibus.Dispatch(DIALOG_MOUSE_ENTER, "");
    }

    private void OnMouseExit()
    {
        Unibus.Dispatch(DIALOG_MOUSE_EXIT, "");
    }

    private void OnButton1ClickHandler()
    {
        this.button1ClickHandler();
        Unibus.Dispatch(DIALOG_MOUSE_EXIT, "");
    }

    private void OnButton2ClickHandler()
    {
        this.button2ClickHandler();
        Unibus.Dispatch(DIALOG_MOUSE_EXIT, "");
    }
}
