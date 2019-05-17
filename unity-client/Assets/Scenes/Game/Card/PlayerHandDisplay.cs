using UnityEngine;
using UnibusEvent;
using DG.Tweening;

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
            card.ZoomIn(2f);
            card.transform.position += new Vector3(0, 3.4F, 0);
            //card.transform.DOMove(card.transform.position + new Vector3(0, 3.4F, 0), 3);
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.transform.IsChildOf(this.transform))
        {
            card.ZoomOut();
            card.transform.position -= new Vector3(0, 3.4F, 0);
            //card.transform.DOMove(card.transform.position - new Vector3(0, 3.4F, 0), 3);
        }
    }
}
