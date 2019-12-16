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
        unit.CardDisplay.SwitchToTableZoomedView();
    }

    private void OnUnitBoardMouseExit(UnitDisplay unit)
    {
        unit.CardDisplay.SwitchToDefaultZoomView();
    }

    private void OnCardMouseEnter(CardDisplay card)
    {
        if (card.UnitDisplay)
        {
            var tile = boardCreator.GetTileByUnit(card.UnitDisplay);
            tile.HighlightOn();

            card.UnitDisplay.DisableTeamColor();
        }
    }

    private void OnCardMouseExit(CardDisplay card)
    {
        if (card.UnitDisplay)
        {
            var tile = boardCreator.GetTileByUnit(card.UnitDisplay);
            tile.HighlightOff();

            card.UnitDisplay.EnableTeamColor();
        }
    }
}
