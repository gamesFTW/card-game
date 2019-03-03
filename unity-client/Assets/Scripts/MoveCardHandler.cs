using UnityEngine;
using UnibusEvent;

public class MoveCardHandler : MonoBehaviour
{
    public static readonly string CARD_MOVE = "CARD_MOVE";

    private UnitDisplay SelectedUnit;
    private bool MouseOnTile = false;

    void Start()
    {
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_OVER, OnTileMouseOver);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_EXIT, OnTileMouseExit);
    }

    void Update()
    {
        CheckClickOutOfAnyCard();
    }

    void CheckClickOutOfAnyCard()
    {
        var leftMouseClicked = Input.GetButtonDown("Fire1");
        if (leftMouseClicked && MouseOnTile == false)
        {
            SelectedUnit = null;
        }
    }

    void OnUnitSelectedOnBoard(UnitDisplay unitDisplay)
    {
        SelectedUnit = unitDisplay;
    }

    void OnClickedOnVoidTile(Point point)
    {
        if (SelectedUnit != null)
        {
            Unibus.Dispatch<MoveCardAction>(CARD_MOVE, new MoveCardAction
            {
                cardId = SelectedUnit.CardData.id,
                x = point.x.ToString(),
                y = point.y.ToString()
            });
        }
    }

    void OnTileMouseOver(Point point)
    {
        MouseOnTile = true;
    }

    void OnTileMouseExit(Point point)
    {
        MouseOnTile = false;
    }
}
