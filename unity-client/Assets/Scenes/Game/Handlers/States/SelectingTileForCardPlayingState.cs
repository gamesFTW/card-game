using UnibusEvent;
using UnityEngine;
using System.Collections.Generic;

public class SelectingTileForCardPlayingState : MonoBehaviour
{

    public ActionEmmiter actionEmmiter;

    private PlayerActionsOnBoardStates states;
    private BoardCreator boardCreator;

    private CardDisplay SelectedCard;
    private bool MouseOnCard = false;

    private bool enabled = false;
    private bool skipedFirstCheckClickOutOfAnyCard = false;

    private List<Point> points;

    private TileDisplay hoveredTile;

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
        card.Select();
        this.points = this.boardCreator.ShowPlacesToCastCreatures();

        Dialog.instance.ShowDialog("Choose square to summon unit to it", "Cancel", this.SkipSelection);

        CursorController.SetPointer();

        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_LEFT_CLICK, OnTileMouseLeftClick);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardEnter);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardExit);
        Unibus.Subscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, OnTileMouseEnterOnBoard);
        Unibus.Subscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, OnTileMouseExitOnBoard);
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
                    this.SkipSelection();
                }
            }
        }
    }

    private void SkipSelection()
    {
        this.Disable();
        this.states.noSelectionsState.Enable();
    }

    private void PlayCard(Point point)
    {
        this.actionEmmiter.EmmitCardPlayAction(this.SelectedCard, point);

        this.Disable();
        this.states.noSelectionsState.Enable();
    }

    private void Disable()
    {
        this.enabled = false;
        this.SelectedCard.Unselect();
        this.SelectedCard = null;
        this.boardCreator.RemoveAllBlinks();

        if (this.hoveredTile)
        {
            this.hoveredTile.HighlightOff();
        }

        Dialog.instance.HideDialog();

        Unibus.Unsubscribe<Point>(TileDisplay.TILE_MOUSE_LEFT_CLICK, OnTileMouseLeftClick);
        Unibus.Unsubscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardEnter);
        Unibus.Unsubscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardExit);
        Unibus.Unsubscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, OnTileMouseEnterOnBoard);
        Unibus.Unsubscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, OnTileMouseExitOnBoard);
    }

    private void OnTileMouseLeftClick(Point point)
    {
        if (this.SelectedCard != null)
        {
            this.PlayCard(point);
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

    private void OnTileMouseEnterOnBoard(TileDisplay tile)
    {
        this.hoveredTile = tile;
        if (this.boardCreator.CheckTileInPoints(tile, points))
        {
            tile.HighlightOn();
        }
    }

    private void OnTileMouseExitOnBoard(TileDisplay tile)
    {
        this.hoveredTile = null;
        tile.HighlightOff();
    }
}
