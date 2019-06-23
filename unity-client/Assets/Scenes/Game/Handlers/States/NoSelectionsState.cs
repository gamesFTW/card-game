using UnibusEvent;

public class NoSelectionsState
{
    private PlayerActionsOnBoard playerActionsOnBoard;
    private BoardCreator boardCreator;

    public NoSelectionsState(PlayerActionsOnBoard playerActionsOnBoard, BoardCreator boardCreator)
    {
        this.playerActionsOnBoard = playerActionsOnBoard;
        this.boardCreator = boardCreator;
    }

    public void Enable()
    {
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    private void Disable()
    {
        this.boardCreator.RemoveAllPathReach();
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
            this.boardCreator.ShowPathReach(clickedUnitDisplay);
        }
    }

    private void OnUnitMouseExitOnBoard(UnitDisplay clickedUnitDisplay)
    {
        this.boardCreator.RemoveAllPathReach();
    }
}
