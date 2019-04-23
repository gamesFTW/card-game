using UnityEngine;
using UnibusEvent;

public class PlayerHandDisplay : MonoBehaviour
{
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
            card.ZoomIn();
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
