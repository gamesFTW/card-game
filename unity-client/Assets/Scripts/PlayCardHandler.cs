using UnityEngine;
using UnibusEvent;
using System.Collections.Generic;

public class PlayCardHandler : MonoBehaviour
{
    public static readonly string CARD_PLAY = "CARD_PLAY";

    private string SelectedCardId;

    void Start()
    {
        Unibus.Subscribe<string>(CardDisplay.CARD_SELECTED_TO_PLAY, OnCardPlay);
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
            SelectedCardId = null;
        }
    }

    void OnCardPlay(string id)
    {
        SelectedCardId = id;
    }

    void OnTileMouseLeftClick(Point point)
    {
        if (SelectedCardId != null)
        {
            Unibus.Dispatch<PlayCardAction>(CARD_PLAY, new PlayCardAction {
                cardId = SelectedCardId,
                x = point.x.ToString(),
                y = point.y.ToString()
            });

            SelectedCardId = null;
        }
    }
}
