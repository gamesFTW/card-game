using UnityEngine;
using UnibusEvent;
using System.Drawing;
using System.Collections.Generic;

public class PlayCardHandler : MonoBehaviour
{
    public static readonly string CARD_PLAY = "CARD_PLAY";

    private string SelectedCardId;
    private string MouseOverCardId;

    void Start()
    {
        Unibus.Subscribe<string>(CardDisplay.CARD_MOUSE_OVER, OnCardMouseOver);
        Unibus.Subscribe<string>(CardDisplay.CARD_MOUSE_OUT, OnCardMouseOut);
        Unibus.Subscribe<string>(CardDisplay.CARD_PRE_PLAY, OnCardPlay);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_LEFT_CLICK, OnTileMouseLeftClick);
    }

    void Update()
    {
        var leftMouseClicked = Input.GetButtonDown("Fire1");
        if (leftMouseClicked && MouseOverCardId == null)
        {
            SelectedCardId = null;
        }
    }

    void OnCardPlay(string id)
    {
        SelectedCardId = id;
    }

    void OnCardMouseOver(string id)
    {
        MouseOverCardId = id;
    }

    void OnCardMouseOut(string id)
    {
        MouseOverCardId = null;
    }

    void OnTileMouseLeftClick(Point point)
    {
        if (SelectedCardId != null)
        {
            Unibus.Dispatch<Dictionary<string, string>>(CARD_PLAY, new Dictionary<string, string>{
                { "cardId", SelectedCardId },
                { "x", point.X.ToString() },
                { "y", point.Y.ToString() },
            });
        }
    }
}
