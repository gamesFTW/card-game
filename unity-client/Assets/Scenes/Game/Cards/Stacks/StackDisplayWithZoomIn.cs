using System.Collections;
using System.Collections.Generic;
using UnibusEvent;
using UnityEngine;

public class StackDisplayWithZoomIn : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardMouseEnter);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardMouseExit);
    }

    private void OnCardMouseEnter(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            card.SwitchToTableZoomedView();
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            card.SwitchToDefaultZoomView();
        }
    }
}
