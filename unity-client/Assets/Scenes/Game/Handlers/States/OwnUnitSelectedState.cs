using UnibusEvent;

public class OwnUnitSelectedState : SelectingState
{
    private bool MouseOnTile = false;
    private UnitDisplay selectedUnit;

    public OwnUnitSelectedState(PlayerActionsOnBoard playerActionsOnBoard, BoardCreator boardCreator) : base(playerActionsOnBoard, boardCreator) { }

    public void Enable(UnitDisplay selectedUnit)
    {
        this.Enable();

        this.selectedUnit = selectedUnit;

        this.Select(selectedUnit);

        this.boardCreator.ShowPathReach(selectedUnit);

        Unibus.Dispatch(AudioController.CARD_SELECTED, selectedUnit.CardDisplay);

        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
    }

    protected override void Disable()
    {
        this.playerActionsOnBoard.boardCreator.RemoveAllPathReach();

        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
    }

    protected override void EnableNoSelectionsState()
    {
        this.Unselect(this.selectedUnit);
        Disable();
        this.playerActionsOnBoard.noSelectionsState.Enable();
    }

    private void EnableOwnUnitSelectedState(UnitDisplay unitDisplay)
    {
        this.Unselect(this.selectedUnit);
        this.Disable();
        this.playerActionsOnBoard.ownUnitSelectedState.Enable(unitDisplay);
    }

    private void EnableSelectingPushTargetState(UnitDisplay unitDisplay)
    {
        this.Disable();
        this.playerActionsOnBoard.selectingPushTargetState.Enable(this.selectedUnit, unitDisplay);
    }

    private void EnableSelectingRicochetTargetState(UnitDisplay unitDisplay)
    {
        this.Disable();
        this.playerActionsOnBoard.selectingRicochetTargetState.Enable(this.selectedUnit, unitDisplay);
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (clickedUnitDisplay.CardDisplay.IsAlly)
        {
            this.EnableOwnUnitSelectedState(clickedUnitDisplay);
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
                this.playerActionsOnBoard.EmmitCardAttackAction(this.selectedUnit, clickedUnitDisplay);

                this.EnableNoSelectionsState();
            }
        }
    }

    private void OnClickedOnVoidTile(Point point)
    {
        this.playerActionsOnBoard.EmmitCardMoveAction(this.selectedUnit, point);

        this.EnableNoSelectionsState();
    }
}