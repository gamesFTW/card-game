using UnibusEvent;
using UnityEngine;

public class ClickOutOfBoardEmmiter
{
    public static string CLICK_OUT_OF_BOARD = "ClickOutOfBoardEmmiter:CLICK_OUT_OF_BOARD";
    public static string RIGHT_CLICK = "ClickOutOfBoardEmmiter:RIGHT_CLICK";

    private bool MouseOnTile = false;
    private bool skipedFirstCheckClickOutOfAnyCard = false;

    public ClickOutOfBoardEmmiter()
    {
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_ENTER, OnTileMouseEnter);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_EXIT, OnTileMouseExit);
        Unibus.Subscribe<AbilityDisplay>(AbilityDisplay.ABILITY_MOUSE_ENTER, OnTileMouseEnter);
        Unibus.Subscribe<AbilityDisplay>(AbilityDisplay.ABILITY_MOUSE_EXIT, OnTileMouseExit);
    }

    private void OnTileMouseEnter(Point point)
    {
        this.MouseOnTile = true;
    }

    private void OnTileMouseExit(Point point)
    {
        this.MouseOnTile = false;
    }

    private void OnTileMouseEnter(AbilityDisplay point)
    {
        this.MouseOnTile = true;
    }

    private void OnTileMouseExit(AbilityDisplay point)
    {
        this.MouseOnTile = false;
    }

    public void CheckClickOutOfAnyCard()
    {
        // Хоть убей я не придумал как сделать по другому.
        if (!this.skipedFirstCheckClickOutOfAnyCard)
        {
            this.skipedFirstCheckClickOutOfAnyCard = true;
        }
        else
        {
            var leftMouseClicked = Input.GetButtonDown("Fire1");
            if (leftMouseClicked && MouseOnTile == false)
            {
                Unibus.Dispatch<string>(ClickOutOfBoardEmmiter.CLICK_OUT_OF_BOARD, "");
            }

            var rightMouseClicked = Input.GetButtonDown("Fire2");
            if (rightMouseClicked)
            {
                Unibus.Dispatch<string>(ClickOutOfBoardEmmiter.RIGHT_CLICK, "");
            }
        }
    }

    public void Reset()
    {
        this.skipedFirstCheckClickOutOfAnyCard = false;
    }
}
