using UnibusEvent;

public class PlayerHandDisplay : StackDisplay
{ 
    public static readonly string CARD_SELECTED_TO_PLAY = "PlayerHandDisplay:CARD_SELECTED_TO_PLAY";

    // Start is called before the first frame update
    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardMouseEnter);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardMouseExit);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_CLICKED, OnCardSelectedToPlayHandler);
    }

    private void OnCardMouseEnter(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            card.SwitchToPlayerHandZoomedView();
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            card.SwitchToDefaultZoomView();
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
