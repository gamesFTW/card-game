using UnityEngine;
using System;

public class CardStatusText : MonoBehaviour
{
    public string abilityDescription;

    public Action<string> OnCustomMouseEnter;
    public Action OnCustomMouseExit;

    private MouseHandlers mouseHandlers;

    private void Awake()
    {
        this.mouseHandlers = this.GetComponent<MouseHandlers>();
    }

    private void Start()
    {
        this.mouseHandlers.MouseEnterHandler = MouseEnterHandler;
        this.mouseHandlers.MouseExitHandler = OnCustomMouseExit;
    }

    private void MouseEnterHandler()
    {
        this.OnCustomMouseEnter(abilityDescription);
    }
}
