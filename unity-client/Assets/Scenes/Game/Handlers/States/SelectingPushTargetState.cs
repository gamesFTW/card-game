using UnityEngine;
using UnibusEvent;

public class SelectingPushTargetState : SelectingState
{
    private UnitDisplay attackerSelectedUnit;
    private UnitDisplay attackedSelectedUnit;

    public SelectingPushTargetState(PlayerActionsOnBoardStates states, BoardCreator boardCreator) : base(states, boardCreator) { }

    public void Enable(UnitDisplay attackerSelectedUnit, UnitDisplay attackedSelectedUnit)
    {
        this.Enable();
        this.attackerSelectedUnit = attackerSelectedUnit;
        this.attackedSelectedUnit = attackedSelectedUnit;

        this.boardCreator.ShowPushReach(attackerSelectedUnit, attackedSelectedUnit);

        Unibus.Subscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);

        Dialog.instance.ShowDialog("Choose square to move attacking unit (push ability)", "Don't push", this.OnDontPushButtonClick, "Cancel", this.EnableNoSelectionsState);

        this.attackerSelectedUnit.CardDisplay.Select();
    }

    protected override void Disable()
    {
        base.Disable();
        this.boardCreator.RemoveAllBlinks();
        Dialog.instance.HideDialog();

        Unibus.Unsubscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
    }

    protected override void EnableNoSelectionsState()
    {
        this.attackerSelectedUnit.CardDisplay.Unselect();
        this.attackedSelectedUnit.CardDisplay.Unselect();

        this.Disable();
        this.states.noSelectionsState.Enable();
    }

    private void OnClickedOnVoidTile(Point point)
    {
        this.actionEmmiter.EmmitCardAttackAction(this.attackerSelectedUnit, this.attackedSelectedUnit, point);

        this.EnableNoSelectionsState();
    }

    private void OnDontPushButtonClick()
    {
        this.actionEmmiter.EmmitCardAttackAction(this.attackerSelectedUnit, this.attackedSelectedUnit);
        this.EnableNoSelectionsState();
    }
}
