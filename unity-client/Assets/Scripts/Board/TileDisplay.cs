using UnityEngine;
using UnibusEvent;
using UnityEngine.EventSystems;

public class TileDisplay : MonoBehaviour
{
    public static readonly string TILE_MOUSE_LEFT_CLICK = "TILE_MOUSE_LEFT_CLICK";

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
}
