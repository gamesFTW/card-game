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
        if (this.boardCreator.hoveredUnit)
        {
            this.OnUnitMouseEnterOnBoard(this.boardCreator.hoveredUnit);
        }

        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
        Unibus.Subscribe<CardDisplay>(PlayerTableDisplay.CARD_SELECTED_ON_TABLE, OnCardClicked);
    }

    public void Disable()
    {
        CursorController.SetDefault();

        this.boardCreator.RemoveAllBlinks();
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
        Unibus.Unsubscribe<CardDisplay>(PlayerTableDisplay.CARD_SELECTED_ON_TABLE, OnCardClicked);
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        this.TryToSelectUnit(clickedUnitDisplay.CardDisplay);
    }

    private void OnCardClicked(CardDisplay cardDisplay)
    {
        this.TryToSelectUnit(cardDisplay);
    }

    private void TryToSelectUnit(CardDisplay cardDisplay)
    {
        if (cardDisplay.IsAlly && !cardDisplay.cardData.tapped)
        {
            this.OnAllySelected(cardDisplay.UnitDisplay);
        }
    }

    private void OnUnitMouseEnterOnBoard(UnitDisplay unit)
    {
        if (unit.CardDisplay.IsAlly && !unit.CardDisplay.cardData.tapped)
        {
            unit.CardDisplay.OverHighlightOn();

            this.boardCreator.ShowPathReach(unit);

            if (unit.CardData.abilities.range != null)
            {
                Point attackerPosition = this.boardCreator.GetUnitPosition(unit);
                this.boardCreator.ShowRangeAttackReach(unit, attackerPosition);
            }

            CursorController.SetPointer();
        }
    }
    
    private void OnUnitMouseExitOnBoard(UnitDisplay unit)
    {
        this.boardCreator.RemoveAllBlinks();
        unit.CardDisplay.OverHighlightOff();

        CursorController.SetDefault();
    }
}
