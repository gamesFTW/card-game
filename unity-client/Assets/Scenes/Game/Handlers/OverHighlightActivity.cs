using UnibusEvent;
using UnityEngine;

public class OverHighlightActivity
{
    private BoardCreator boardCreator;

    public OverHighlightActivity(BoardCreator boardCreator)
    {
        this.boardCreator = boardCreator;
    }

    public void Enable()
    {
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
        Unibus.Subscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, OnTileWithoutUnitMouseEnterOnBoard);
        Unibus.Subscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, OnTileWithoutUnitMouseExitOnBoard);
    }

    public void Disable()
    {
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
        Unibus.Unsubscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, OnTileWithoutUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, OnTileWithoutUnitMouseExitOnBoard);
    }

    private void OnUnitMouseEnterOnBoard(UnitDisplay unit)
    {
        unit.CardDisplay.OverHighlightOn();
    }

    private void OnUnitMouseExitOnBoard(UnitDisplay unit)
    {
        unit.CardDisplay.OverHighlightOff();

        this.boardCreator.GetTileByUnit(unit.gameObject).GetComponent<TileDisplay>().HighlightOff();
    }

    private void OnTileWithoutUnitMouseEnterOnBoard(TileDisplay tile)
    {
        tile.HighlightOn();
    }

    private void OnTileWithoutUnitMouseExitOnBoard(TileDisplay tile)
    {
        tile.HighlightOff();
    }
}
