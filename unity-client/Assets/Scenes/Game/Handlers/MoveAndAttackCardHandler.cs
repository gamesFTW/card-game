using UnibusEvent;
using UnityEngine;

public class MoveAndAttackCardHandler : MonoBehaviour
{
    public static readonly string CARD_MOVE = "CARD_MOVE";
    public static readonly string CARD_ATTACK = "CARD_ATTACK";

    private UnitDisplay SelectedUnit;
    private bool MouseOnTile = false;

    private BoardCreator boardCreator;

    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_DIED, OnCardDied);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_ENTER, OnTileMouseEnter);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_EXIT, OnTileMouseExit);

        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();
    }

    void Update()
    {
        CheckClickOutOfAnyCard();
    }

    void CheckClickOutOfAnyCard()
    {
        var leftMouseClicked = Input.GetButtonDown("Fire1");
        if (leftMouseClicked && MouseOnTile == false && SelectedUnit)
        {
            UnselectSelectedUnit();
        }
    }

    void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (SelectedUnit == null)
        {
            SelectUnit(clickedUnitDisplay);
        }
        else
        {
            if (SelectedUnit.CardData.ownerId == clickedUnitDisplay.CardData.ownerId)
            {
                UnselectSelectedUnit();
                SelectUnit(clickedUnitDisplay);
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
            UnselectSelectedUnit();
        }
    }

    void OnTileMouseEnter(Point point)
    {
        MouseOnTile = true;
    }

    void OnTileMouseExit(Point point)
    {
        MouseOnTile = false;
    }

    void EmmitCardAttackAction(UnitDisplay attackerUnit, UnitDisplay attackedUnit)
    {
        bool isCardsAdjacent = boardCreator.CheckCardsAdjacency(attackerUnit.gameObject, attackedUnit.gameObject);
        bool isRangeAttack = !isCardsAdjacent;

        Unibus.Dispatch<AttackCardAction>(CARD_ATTACK, new AttackCardAction
        {
            attackerCardId = attackerUnit.CardData.id,
            attackedCardId = attackedUnit.CardData.id,
            isRangeAttack = isRangeAttack
        });
    }

    void SelectUnit(UnitDisplay unit)
    {
        GameObject tile = boardCreator.GetTileByUnit(unit.gameObject);
        tile.GetComponent<TileDisplay>().SelectedHighlightOn();

        unit.CardDisplay.SelectedHighlightOn();

        SelectedUnit = unit;
    }

    void UnselectSelectedUnit()
    {
        UnselectUnit(SelectedUnit.CardDisplay);
        SelectedUnit = null;
    }

    void UnselectUnit(CardDisplay cardDisplay)
    {
        GameObject tile = boardCreator.GetTileByUnit(cardDisplay.UnitDisplay.gameObject);
        tile.GetComponent<TileDisplay>().SelectedHighlightOff();

        cardDisplay.SelectedHighlightOff();
    }

    void OnCardDied(CardDisplay cardDisplay)
    {
        UnselectUnit(cardDisplay);
    }
}
