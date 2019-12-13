using System;
using UnibusEvent;

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
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_CLICKED, OnCardClicked);

        overHighlightActivity.Enable();
    }

    public void Disable()
    {
        overHighlightActivity.Disable();

        this.boardCreator.RemoveAllBlinks();
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
        Unibus.Unsubscribe<CardDisplay>(CardDisplay.CARD_CLICKED, OnCardClicked);
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
