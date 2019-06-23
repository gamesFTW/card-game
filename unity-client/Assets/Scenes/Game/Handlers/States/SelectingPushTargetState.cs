
using UnibusEvent;

public class SelectingPushTargetState : SelectingState
{
    private UnitDisplay attackerSelectedUnit;
    private UnitDisplay attackedSelectedUnit;

    public SelectingPushTargetState(PlayerActionsOnBoard playerActionsOnBoard, BoardCreator boardCreator) : base(playerActionsOnBoard, boardCreator) { }

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
        this.playerActionsOnBoard.boardCreator.RemoveAllPathReach();

        Unibus.Unsubscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
    }

    protected override void EnableNoSelectionsState()
    {
        this.Unselect(this.attackerSelectedUnit);
        this.Unselect(this.attackedSelectedUnit);

        this.Disable();
        this.playerActionsOnBoard.noSelectionsState.Enable();
    }

    private void OnClickedOnVoidTile(Point point)
    {
        this.playerActionsOnBoard.EmmitCardAttackAction(this.attackerSelectedUnit, this.attackedSelectedUnit, point);

        this.EnableNoSelectionsState();
    }
}
