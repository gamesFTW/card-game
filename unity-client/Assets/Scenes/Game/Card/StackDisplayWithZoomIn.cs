using System.Collections;
using System.Collections.Generic;
using UnibusEvent;
using UnityEngine;

public class StackDisplayWithZoomIn : MonoBehaviour
{
    public static float CARD_ZOOM = 3f;

    // Start is called before the first frame update
    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardMouseEnter);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardMouseExit);
    }

    private void OnCardMouseEnter(CardDisplay card)
    {
        if (card.transform.IsChildOf(this.transform))
        {
            card.ZoomIn(StackDisplayWithZoomIn.CARD_ZOOM);
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.transform.IsChildOf(this.transform))
        {
            card.ZoomOut();
        }
    }
}
