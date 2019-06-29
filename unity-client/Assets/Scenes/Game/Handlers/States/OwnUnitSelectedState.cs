using UnibusEvent;
using UnityEngine;

public class OwnUnitSelectedState : SelectingState
{
    private bool MouseOnTile = false;
    private UnitDisplay selectedUnit;

    public OwnUnitSelectedState(PlayerActionsOnBoardStates states, BoardCreator boardCreator) : base(states, boardCreator) { }

    public void Enable(UnitDisplay selectedUnit)
    {
        this.Enable();

        this.selectedUnit = selectedUnit;

        this.Select(selectedUnit);

        this.boardCreator.ShowPathReach(selectedUnit);

        Unibus.Dispatch(AudioController.CARD_SELECTED, selectedUnit.CardDisplay);

        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);

        if (selectedUnit.CardData.abilities.range != null)
        {
            Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
            Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
        }
    }

    protected override void Disable()
    {
        base.Disable();
        this.boardCreator.RemoveAllTileBlinks();

        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
    }

    protected override void EnableNoSelectionsState()
    {
        this.Unselect(this.selectedUnit);
        Disable();
        this.states.noSelectionsState.Enable();
    }

    private void AttackEnemy(UnitDisplay enemyDisplay)
    {
        this.actionEmmiter.EmmitCardAttackAction(this.selectedUnit, enemyDisplay);

        this.EnableNoSelectionsState();
    }

    private void MoveUnit(Point point)
    {
        this.actionEmmiter.EmmitCardMoveAction(this.selectedUnit, point);

        this.EnableNoSelectionsState();
    }

    private void ChangeSelectedToAnotherAlly(UnitDisplay unitDisplay)
    {
        this.Unselect(this.selectedUnit);
        this.Disable();
        this.states.ownUnitSelectedState.Enable(unitDisplay);
    }

    private void EnableSelectingPushTargetState(UnitDisplay unitDisplay)
    {
        this.Disable();
        this.states.selectingPushTargetState.Enable(this.selectedUnit, unitDisplay);
    }

    private void EnableSelectingRicochetTargetState(UnitDisplay unitDisplay)
    {
        this.Disable();
        this.states.selectingRicochetTargetState.Enable(this.selectedUnit, unitDisplay);
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (clickedUnitDisplay.CardDisplay.IsAlly)
        {
            this.ChangeSelectedToAnotherAlly(clickedUnitDisplay);
        }
        else
        {
            if (this.selectedUnit.CardData.abilities.push != null)
            {
                this.EnableSelectingPushTargetState(clickedUnitDisplay);
            }
            else if (this.selectedUnit.CardData.abilities.ricochet && this.boardCreator.UnitHaveRicochetTargetNearby(clickedUnitDisplay))
            {
                this.EnableSelectingRicochetTargetState(clickedUnitDisplay);
            }
            else
            {
                this.AttackEnemy(clickedUnitDisplay);
            }
        }
    }

    private void OnClickedOnVoidTile(Point point)
    {
        this.MoveUnit(point);
    }

    private void OnUnitMouseEnterOnBoard(UnitDisplay unit)
    {
        if (!unit.CardDisplay.IsAlly)
        {
            this.boardCreator.RemoveAllTileBlinks();
            this.boardCreator.ShowRangeAttackReach(this.selectedUnit, unit);
        }
    }

    private void OnUnitMouseExitOnBoard(UnitDisplay unit)
    {
        this.boardCreator.RemoveAllTileBlinks();
        this.boardCreator.ShowPathReach(this.selectedUnit);
    }
}
