using System;
using UnibusEvent;
using UnityEngine;

public class HandActivities
{
    public Action<CardDisplay> OnCardSelectedToPlay;

    private PlayerActionsOnBoardStates states;

    public HandActivities(PlayerActionsOnBoardStates states)
    {
        this.states = states;
    }

    public void Enable()
    {
        Unibus.Subscribe<CardDisplay>(PlayerHandDisplay.CARD_SELECTED_TO_PLAY, OnCardSelectedToPlayHandler);
    }

    public void Disable()
    {
        Unibus.Unsubscribe<CardDisplay>(PlayerHandDisplay.CARD_SELECTED_TO_PLAY, OnCardSelectedToPlayHandler);
    }

    private void OnCardSelectedToPlayHandler(CardDisplay card)
    {
        this.OnCardSelectedToPlay(card);
    }
}
