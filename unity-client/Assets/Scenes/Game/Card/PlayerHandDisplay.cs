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
            card.transform.position += new Vector3(0, 2.5F, 0);
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.transform.IsChildOf(this.transform))
        {
            card.ZoomOut();
            card.transform.position -= new Vector3(0, 2.5F, 0);
        }
    }
}
