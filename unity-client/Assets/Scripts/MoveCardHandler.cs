using UnityEngine;
using UnibusEvent;

public class MoveCardHandler : MonoBehaviour
{
    public static readonly string CARD_MOVE = "CARD_MOVE";
    public static readonly string CARD_ATTACK = "CARD_ATTACK";

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

    void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (SelectedUnit == null)
        {
            SelectedUnit = clickedUnitDisplay;
        }
        else
        {
            if (SelectedUnit.CardData.ownerId == clickedUnitDisplay.CardData.ownerId)
            {
                SelectedUnit = clickedUnitDisplay;
            }
            else
            {
                EmmitCardAttackAction(SelectedUnit, clickedUnitDisplay);
            }
        }
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

    void EmmitCardAttackAction(UnitDisplay attackerUnit, UnitDisplay attackedUnit)
    {
        Unibus.Dispatch<AttackCardAction>(CARD_ATTACK, new AttackCardAction
        {
            attackerCardId = attackerUnit.CardData.id,
            attackedCardId = attackedUnit.CardData.id
        });
    }
}
