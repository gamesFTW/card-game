
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

        this.Select(attackedSelectedUnit);
    }

    protected override void Disable()
    {
        base.Disable();
        this.boardCreator.RemoveAllTileBlinks();

        Unibus.Unsubscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
    }

    protected override void EnableNoSelectionsState()
    {
        this.Unselect(this.attackerSelectedUnit);
        this.Unselect(this.attackedSelectedUnit);

        this.Disable();
        this.states.noSelectionsState.Enable();
    }

    private void OnClickedOnVoidTile(Point point)
    {
        this.actionEmmiter.EmmitCardAttackAction(this.attackerSelectedUnit, this.attackedSelectedUnit, point);

        this.EnableNoSelectionsState();
    }
}
