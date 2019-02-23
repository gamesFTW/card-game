using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    void Start()
    {
        Button endOfTurnButton = this.transform.Find("UI/EndOfTurn").GetComponent<Button>();
        endOfTurnButton.onClick.AddListener(OnClick);
    }

    void OnClick()
    {
        ServerApi.EndOfTurn();
    }
}
