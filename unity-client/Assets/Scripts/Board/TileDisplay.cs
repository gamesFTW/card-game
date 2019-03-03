using UnityEngine;
using UnibusEvent;

public class TileDisplay : MonoBehaviour
{
    public static readonly string TILE_MOUSE_LEFT_CLICK = "TILE_MOUSE_LEFT_CLICK";
    public static readonly string TILE_MOUSE_OVER = "TILE_MOUSE_OVER";
    public static readonly string TILE_MOUSE_EXIT = "TILE_MOUSE_EXIT";

    public int x;
    public int y;

    void Start()
    {
        
    }

    void Update()
    {

    }

    void OnMouseDown()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_LEFT_CLICK, new Point(x, y));
    }

    void OnMouseOver()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_OVER, new Point(x, y));
    }

    void OnMouseExit()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_EXIT, new Point(x, y));
    }
}
