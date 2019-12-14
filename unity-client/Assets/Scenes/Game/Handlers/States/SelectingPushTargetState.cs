using UnibusEvent;
using System.Collections.Generic;
using UnityEngine;

public class SelectingPushTargetState : SelectingState
{
    private UnitDisplay attackerSelectedUnit;
    private UnitDisplay attackedSelectedUnit;

    private List<Point> points;

    public SelectingPushTargetState(PlayerActionsOnBoardStates states, BoardCreator boardCreator) : base(states, boardCreator) { }

    private TileDisplay hoveredTile;

    public void Enable(UnitDisplay attackerSelectedUnit, UnitDisplay attackedSelectedUnit)
    {
        this.Enable();
        this.attackerSelectedUnit = attackerSelectedUnit;
        this.attackedSelectedUnit = attackedSelectedUnit;

        this.points = this.boardCreator.ShowPushReach(attackerSelectedUnit, attackedSelectedUnit);

        Unibus.Subscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
        Unibus.Subscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, OnTileMouseEnterOnBoard);
        Unibus.Subscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, OnTileMouseExitOnBoard);

        Dialog.instance.ShowDialog("Choose square to move attacking unit to it (push ability)", "Don't push", this.OnDontPushButtonClick, "Cancel", this.EnableNoSelectionsState);

        this.attackerSelectedUnit.CardDisplay.Select();
        CursorController.SetPointer();
    }

    protected override void Disable()
    {
        base.Disable();
        this.boardCreator.RemoveAllBlinks();
        Dialog.instance.HideDialog();

        if (this.hoveredTile)
        {
            this.hoveredTile.HighlightOff();
        }

        CursorController.SetDefault();

        Unibus.Unsubscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
        Unibus.Unsubscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, OnTileMouseEnterOnBoard);
        Unibus.Unsubscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, OnTileMouseExitOnBoard);
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

    private void OnTileMouseEnterOnBoard(TileDisplay tile)
    {
        this.hoveredTile = tile;
        if (this.boardCreator.CheckTileInPoints(tile, points))
        {
            tile.HighlightOn();
            CursorController.SetPointer();
        } else
        {
            CursorController.SetPointerForbidden();
        }
    }

    private void OnTileMouseExitOnBoard(TileDisplay tile)
    {
        CursorController.SetPointer();
        this.hoveredTile = null;
        tile.HighlightOff();
    }
}
