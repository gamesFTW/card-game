using UnibusEvent;
using System.Collections.Generic;

public class SelectingHealingTargetState : SelectingState
{
    private UnitDisplay selectedUnit;

    public SelectingHealingTargetState(PlayerActionsOnBoardStates states, BoardCreator boardCreator) : base(states, boardCreator) { }

    private List<Point> points;

    public void Enable(UnitDisplay selectedUnit, HealingAbility healingAbility)
    {
        this.Enable();
        this.selectedUnit = selectedUnit;

        this.points = this.boardCreator.BlinkHealTargets(selectedUnit, healingAbility.range);

        CursorController.SetPointer();

        Dialog.instance.ShowDialog("Choose ally unit to heal (Heal ability)", "Cancel", this.EnableNoSelectionsState);

        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    protected override void Disable()
    {
        base.Disable();
        Dialog.instance.HideDialog();

        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    protected override void EnableNoSelectionsState()
    {
        this.selectedUnit.CardDisplay.Unselect();

        this.boardCreator.RemoveAllBlinks();

        this.Disable();
        this.states.noSelectionsState.Enable();
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (clickedUnitDisplay.CardDisplay.IsAlly)
        {
            this.actionEmmiter.EmmitCardHealingAction(this.selectedUnit, clickedUnitDisplay);
            this.EnableNoSelectionsState();
        }
    }

    private void OnUnitMouseEnterOnBoard(UnitDisplay unit)
    {
        if (unit.CardDisplay.IsAlly && this.boardCreator.CheckUnitInPoints(unit, this.points))
        {
            unit.OverHighlightOn();
        }
    }

    private void OnUnitMouseExitOnBoard(UnitDisplay unit)
    {
        unit.OverHighlightOff();
    }
}