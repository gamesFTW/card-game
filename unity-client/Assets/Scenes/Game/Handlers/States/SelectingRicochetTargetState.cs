using System.Collections.Generic;
using UnibusEvent;

public class SelectingRicochetTargetState : SelectingState
{
    private UnitDisplay attackerSelectedUnit;
    private UnitDisplay attackedSelectedUnit;

    private List<Point> points;

    public SelectingRicochetTargetState(PlayerActionsOnBoardStates states, BoardCreator boardCreator) : base(states, boardCreator) { }

    public void Enable(UnitDisplay attackerSelectedUnit, UnitDisplay attackedSelectedUnit)
    {
        this.Enable();
        this.attackerSelectedUnit = attackerSelectedUnit;
        this.attackedSelectedUnit = attackedSelectedUnit;

        this.points = this.boardCreator.BlinkRicochetTargets(attackedSelectedUnit);

        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);

        CursorController.SetPointer();

        Dialog.instance.ShowDialog("Choose enemy unit for ricochet target (ricochet ability)", "Cancel", this.EnableNoSelectionsState);

        attackedSelectedUnit.CardDisplay.Select();
    }

    protected override void Disable()
    {
        base.Disable();
        this.boardCreator.RemoveAllBlinks();
        Dialog.instance.HideDialog();

        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    protected override void EnableNoSelectionsState()
    {
        this.attackerSelectedUnit.CardDisplay.Unselect();
        this.attackedSelectedUnit.CardDisplay.Unselect();

        this.Disable();
        this.states.noSelectionsState.Enable();
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (!clickedUnitDisplay.CardDisplay.IsAlly)
        {
            this.actionEmmiter.EmmitCardAttackAction(this.attackerSelectedUnit, this.attackedSelectedUnit, null, clickedUnitDisplay);
            this.EnableNoSelectionsState();
        }
    }

    private void OnUnitMouseEnterOnBoard(UnitDisplay unit)
    {
        if (!unit.CardDisplay.IsAlly && this.boardCreator.CheckUnitInPoints(unit, this.points))
        {
            unit.OverHighlightOn();
        }
    }

    private void OnUnitMouseExitOnBoard(UnitDisplay unit)
    {
        unit.OverHighlightOff();
    }
}
