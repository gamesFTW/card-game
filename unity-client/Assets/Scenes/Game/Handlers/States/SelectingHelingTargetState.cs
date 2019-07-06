using UnibusEvent;

public class SelectingHealingTargetState : SelectingState
{
    private UnitDisplay selectedUnit;

    public SelectingHealingTargetState(PlayerActionsOnBoardStates states, BoardCreator boardCreator) : base(states, boardCreator) { }

    public void Enable(UnitDisplay selectedUnit, HealingAbility healingAbility)
    {
        this.Enable();
        this.selectedUnit = selectedUnit;

        this.boardCreator.BlinkHealTargets(selectedUnit, healingAbility.range);

        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
    }

    protected override void Disable()
    {
        base.Disable();

        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
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
}
