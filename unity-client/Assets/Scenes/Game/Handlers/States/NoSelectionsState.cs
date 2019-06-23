using UnibusEvent;

public class NoSelectionsState
{
    private PlayerActionsOnBoard playerActionsOnBoard;

    public NoSelectionsState(PlayerActionsOnBoard playerActionsOnBoard)
    {
        this.playerActionsOnBoard = playerActionsOnBoard;
    }

    public void Enable()
    {
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    private void Disable()
    {
        this.playerActionsOnBoard.boardCreator.RemoveAllPathReach();
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (clickedUnitDisplay.CardDisplay.IsAlly)
        {
            this.Disable();
            this.playerActionsOnBoard.ownUnitSelectedState.Enable(clickedUnitDisplay);
        }
    }

    private void OnUnitMouseEnterOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (clickedUnitDisplay.CardDisplay.IsAlly)
        {
            this.playerActionsOnBoard.boardCreator.ShowPathReach(clickedUnitDisplay);
        }
    }

    private void OnUnitMouseExitOnBoard(UnitDisplay clickedUnitDisplay)
    {
        this.playerActionsOnBoard.boardCreator.RemoveAllPathReach();
    }
}
