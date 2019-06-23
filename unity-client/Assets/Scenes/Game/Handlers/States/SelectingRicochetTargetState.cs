
using UnibusEvent;

public class SelectingRicochetTargetState : SelectingState
{
    private UnitDisplay attackerSelectedUnit;
    private UnitDisplay attackedSelectedUnit;

    public SelectingRicochetTargetState(PlayerActionsOnBoard playerActionsOnBoard, BoardCreator boardCreator) : base(playerActionsOnBoard, boardCreator) { }

    public void Enable(UnitDisplay attackerSelectedUnit, UnitDisplay attackedSelectedUnit)
    {
        this.Enable();
        this.attackerSelectedUnit = attackerSelectedUnit;
        this.attackedSelectedUnit = attackedSelectedUnit;

        this.playerActionsOnBoard.boardCreator.BlinkRicochetTargets(attackedSelectedUnit);

        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);

        this.Select(attackedSelectedUnit);
    }

    protected override void Disable()
    {
        this.boardCreator.RemoveAllBlinks();

        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
    }

    protected override void EnableNoSelectionsState()
    {
        this.Unselect(this.attackerSelectedUnit);
        this.Unselect(this.attackedSelectedUnit);

        this.Disable();
        this.playerActionsOnBoard.noSelectionsState.Enable();
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (!clickedUnitDisplay.CardDisplay.IsAlly)
        {
            this.playerActionsOnBoard.EmmitCardAttackAction(this.attackerSelectedUnit, this.attackedSelectedUnit, null, clickedUnitDisplay);
            this.EnableNoSelectionsState();
        }
    }
}
