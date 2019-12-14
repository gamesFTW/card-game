using UnibusEvent;

public class PlayerTableDisplay : StackDisplay
{
    public static readonly string CARD_SELECTED_ON_TABLE = "PlayerHandDisplay:CARD_SELECTED_ON_TABLE";

    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_CLICKED, OnCardClicked);
    }

    private void OnCardClicked(CardDisplay card)
    {
        if (card.Placeholder.IsChildOf(this.transform))
        {
            Unibus.Dispatch(PlayerTableDisplay.CARD_SELECTED_ON_TABLE, card);
        }
    }
}
