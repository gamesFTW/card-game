using System;
using UnibusEvent;
using UnityEngine;

public class HandActivities
{
    public Action<CardDisplay> OnCardSelectedToPlay;

    private PlayerActionsOnBoardStates states;
    private BoardCreator boardCreator;

    public HandActivities(PlayerActionsOnBoardStates states, BoardCreator boardCreator)
    {
        this.states = states;
        this.boardCreator = boardCreator;
    }

    public void Enable()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_SELECTED_TO_PLAY, OnCardSelectedToPlayHandler);
    }

    public void Disable()
    {
        Unibus.Unsubscribe<CardDisplay>(CardDisplay.CARD_SELECTED_TO_PLAY, OnCardSelectedToPlayHandler);
    }

    private void OnCardSelectedToPlayHandler(CardDisplay card)
    {
        this.OnCardSelectedToPlay(card);
    }
}
