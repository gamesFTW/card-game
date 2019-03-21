using UnityEngine;
using UnibusEvent;

public class HoverOnCardAndUnitHighliter : MonoBehaviour
{
    private BoardCreator boardCreator;

    // Start is called before the first frame update
    void Start()
    {
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitBoardMouseEnter);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitBoardMouseExit);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_ENTER, OnCardMouseEnter);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_MOUSE_EXIT, OnCardMouseExit);

        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();
    }

    // Update is called once per frame
    void Update()
    {

    }

    private void OnUnitBoardMouseEnter(UnitDisplay unit)
    {
        unit.CardDisplay.highlightOn();
    }

    private void OnUnitBoardMouseExit(UnitDisplay unit)
    {
        unit.CardDisplay.highlightOff();
    }

    private void OnCardMouseEnter(CardDisplay card)
    {
        if (card.UnitDisplay)
        {
            GameObject tile = boardCreator.GetTileByUnit(card.UnitDisplay.gameObject);
            tile.GetComponent<TileDisplay>().HighlightOn();
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.UnitDisplay)
        {
            GameObject tile = boardCreator.GetTileByUnit(card.UnitDisplay.gameObject);
            tile.GetComponent<TileDisplay>().HighlightOff();
        }
    }
}
