using UnibusEvent;
using UnityEngine;

public abstract class SelectingState
{
    protected PlayerActionsOnBoard playerActionsOnBoard;

    public SelectingState(PlayerActionsOnBoard playerActionsOnBoard)
    {
        this.playerActionsOnBoard = playerActionsOnBoard;
    }

    protected void Enable()
    {
        this.playerActionsOnBoard.clickOutOfBoardEmmiter.Reset();
        Unibus.Subscribe<string>(ClickOutOfBoardEmmiter.CLICK_OUT_OF_BOARD, OnClickOutOfBoard);
        Unibus.Subscribe<string>(ClickOutOfBoardEmmiter.RIGHT_CLICK, OnRightClick);
    }

    protected abstract void Disable();

    protected abstract void EnableNoSelectionsState();

    private void OnClickOutOfBoard(string clickEvent)
    {
        this.EnableNoSelectionsState();
    }

    private void OnRightClick(string clickEvent)
    {
        this.EnableNoSelectionsState();
    }

    protected void Unselect(UnitDisplay selectedUnit)
    {
        GameObject tile = this.playerActionsOnBoard.boardCreator.GetTileByUnit(selectedUnit.gameObject);
        tile.GetComponent<TileDisplay>().SelectedHighlightOff();

        selectedUnit.CardDisplay.SelectedHighlightOff();
    }

    protected void Select(UnitDisplay selectedUnit)
    {
        // Сделать чтобы tile слушал события selectedUnit и сам переключался.
        GameObject tile = this.playerActionsOnBoard.boardCreator.GetTileByUnit(selectedUnit.gameObject);
        tile.GetComponent<TileDisplay>().SelectedHighlightOn();

        selectedUnit.CardDisplay.SelectedHighlightOn();
    }
}
