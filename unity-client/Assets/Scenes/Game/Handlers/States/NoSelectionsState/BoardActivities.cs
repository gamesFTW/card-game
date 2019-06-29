using System;
using UnibusEvent;

public class BoardActivities
{
    private BoardCreator boardCreator;

    public Action<UnitDisplay> OnAllySelected;

    public BoardActivities(BoardCreator boardCreator)
    {
        this.boardCreator = boardCreator;
    }

    public void Enable()
    {
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    public void Disable()
    {
        this.boardCreator.RemoveAllTileBlinks();
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (clickedUnitDisplay.CardDisplay.IsAlly)
        {
            this.OnAllySelected(clickedUnitDisplay);
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
        this.boardCreator.RemoveAllTileBlinks();
    }
}
