using UnibusEvent;
using UnityEngine;

public class TableDisplay : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardMouseEnter);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardMouseExit);
    }

    // Update is called once per frame
    void Update()
    {

    }

    private void OnCardMouseEnter(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            card.EnableTableCollider();
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            card.EnableDefaultCollider();
        }
    }
}
