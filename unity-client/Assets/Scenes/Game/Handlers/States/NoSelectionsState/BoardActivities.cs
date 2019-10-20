using System;
using UnibusEvent;
using UnityEngine;

public class BoardActivities
{
    private BoardCreator boardCreator;
    private OverHighlightActivity overHighlightActivity;

    public Action<UnitDisplay> OnAllySelected;

    public BoardActivities(BoardCreator boardCreator)
    {
        this.boardCreator = boardCreator;
        this.overHighlightActivity = new OverHighlightActivity(boardCreator);
    }

    public void Enable()
    {
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);

        overHighlightActivity.Enable();
    }

    public void Disable()
    {
        overHighlightActivity.Disable();

        this.boardCreator.RemoveAllBlinks();
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

    private void OnUnitMouseEnterOnBoard(UnitDisplay unit)
    {
        if (unit.CardDisplay.IsAlly)
        {
            this.boardCreator.ShowPathReach(unit);

            if (unit.CardData.abilities.range != null)
            {
                Point attackerPosition = this.boardCreator.GetUnitPosition(unit);
                this.boardCreator.ShowRangeAttackReach(unit, attackerPosition);
            }
        }
    }
    
    private void OnUnitMouseExitOnBoard(UnitDisplay unit)
    {
        this.boardCreator.RemoveAllBlinks();
    }
}
