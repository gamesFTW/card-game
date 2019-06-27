using UnityEngine;
using UnibusEvent;

public class PlayerHandDisplay : MonoBehaviour
{
    public static readonly string CARD_SELECTED_TO_PLAY = "PlayerHandDisplay:CARD_SELECTED_TO_PLAY";

    // Start is called before the first frame update
    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardMouseEnter);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardMouseExit);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_SELECTED_TO_PLAY, OnCardSelectedToPlayHandler);
    }

    private void OnCardMouseEnter(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            card.ZoomIn(2f);
            card.transform.position += new Vector3(0, 3.4F, 0);
            //card.transform.DOMove(card.transform.position + new Vector3(0, 3.4F, 0), 3);
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            card.ZoomOut();
            card.transform.position -= new Vector3(0, 3.4F, 0);
            //card.transform.DOMove(card.transform.position - new Vector3(0, 3.4F, 0), 3);
        }
    }

    private void OnCardSelectedToPlayHandler(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            Unibus.Dispatch(PlayerHandDisplay.CARD_SELECTED_TO_PLAY, card);
        }
    }
}
