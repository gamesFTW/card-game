using UnityEngine;
using UnibusEvent;

public class MoveCardHandler : MonoBehaviour
{
    public static readonly string CARD_MOVE = "CARD_MOVE";

    private UnitDisplay SelectedUnit;

    void Start()
    {
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
    }

    void Update()
    {
        CheckClickOutOfAnyCard();
    }

    void CheckClickOutOfAnyCard()
    {
        var leftMouseClicked = Input.GetButtonDown("Fire1");
        if (leftMouseClicked)
        {
            Debug.Log("SelectedUnit = null");
            SelectedUnit = null;
        }
    }

    void OnUnitSelectedOnBoard(UnitDisplay unitDisplay)
    {
        Debug.Log("OnUnitSelectedOnBoard");
        SelectedUnit = unitDisplay;
    }

    void OnClickedOnVoidTile(Point point)
    {
        Debug.Log("OnClickedOnVoidTile");
        if (SelectedUnit != null)
        {
            Unibus.Dispatch<MoveCardAction>(CARD_MOVE, new MoveCardAction
            {
                cardId = SelectedUnit.CardData.id,
                x = point.x.ToString(),
                y = point.y.ToString()
            });

            SelectedUnit = null;
        }
    }
}
