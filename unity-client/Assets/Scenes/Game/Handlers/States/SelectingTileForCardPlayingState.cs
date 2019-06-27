using System.Collections;
using System.Collections.Generic;
using UnibusEvent;
using UnityEngine;

public class SelectingTileForCardPlayingState : MonoBehaviour
{
    public static readonly string CARD_PLAY = "SelectingTileForCardPlayingState:CARD_PLAY";

    private PlayerActionsOnBoardStates states;
    private BoardCreator boardCreator;

    private CardDisplay SelectedCard;
    private bool MouseOnCard = false;

    private bool enabled = false;
    private bool skipedFirstCheckClickOutOfAnyCard = false;

    public SelectingTileForCardPlayingState(PlayerActionsOnBoardStates states, BoardCreator boardCreator)
    {
        this.states = states;
        this.boardCreator = boardCreator;
    }

    public void Enable(CardDisplay card)
    {
        this.skipedFirstCheckClickOutOfAnyCard = false;
        this.enabled = true;
        this.SelectedCard = card;
        card.SelectedHighlightOn();

        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_LEFT_CLICK, OnTileMouseLeftClick);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardEnter);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardExit);
    }

    public void CheckClickOutOfAnyCard()
    {

        if (!this.skipedFirstCheckClickOutOfAnyCard)
        {
            this.skipedFirstCheckClickOutOfAnyCard = true;
        }
        else
        {
            if (this.enabled)
            {
                var leftMouseClicked = Input.GetButtonDown("Fire1");
                if (leftMouseClicked && !this.MouseOnCard && this.SelectedCard)
                {
                    this.Disable();
                    this.states.noSelectionsState.Enable();
                }
            }
        }
    }

    private void Disable()
    {
        this.enabled = false;
        this.SelectedCard.SelectedHighlightOff();
        this.SelectedCard = null;

        Unibus.Unsubscribe<Point>(TileDisplay.TILE_MOUSE_LEFT_CLICK, OnTileMouseLeftClick);
        Unibus.Unsubscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardEnter);
        Unibus.Unsubscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardExit);
    }

    private void OnTileMouseLeftClick(Point point)
    {
        if (this.SelectedCard != null)
        {
            Unibus.Dispatch<PlayCardAction>(CARD_PLAY, new PlayCardAction
            {
                cardId = this.SelectedCard.cardData.id,
                x = point.x.ToString(),
                y = point.y.ToString()
            });

            this.Disable();
            this.states.noSelectionsState.Enable();
        }
    }

    private void OnCardEnter(CardDisplay card)
    {
        this.MouseOnCard = true;
    }

    private void OnCardExit(CardDisplay card)
    {
        this.MouseOnCard = false;
    }
}
