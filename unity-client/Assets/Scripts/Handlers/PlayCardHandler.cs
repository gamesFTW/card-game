using UnityEngine;
using UnibusEvent;
using System.Collections.Generic;

public class PlayCardHandler : MonoBehaviour
{
    public static readonly string CARD_PLAY = "CARD_PLAY";

    private CardDisplay SelectedCard;

    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_SELECTED_TO_PLAY, OnCardPlay);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_LEFT_CLICK, OnTileMouseLeftClick);
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
            SelectedCard.SelectedHighlightOff();
            SelectedCard = null;
        }
    }

    void OnCardPlay(CardDisplay card)
    {
        card.SelectedHighlightOn();
        SelectedCard = card;
    }

    void OnTileMouseLeftClick(Point point)
    {
        if (SelectedCard != null)
        {
            Unibus.Dispatch<PlayCardAction>(CARD_PLAY, new PlayCardAction {
                cardId = SelectedCard.cardData.id,
                x = point.x.ToString(),
                y = point.y.ToString()
            });

            SelectedCard.SelectedHighlightOff();
            SelectedCard = null;
        }
    }
}
