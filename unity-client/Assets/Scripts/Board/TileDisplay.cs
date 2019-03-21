using UnityEngine;
using UnibusEvent;
using UnityEditor.Presets;

public class TileDisplay : MonoBehaviour
{
    public static readonly string TILE_MOUSE_LEFT_CLICK = "TILE_MOUSE_LEFT_CLICK";
    public static readonly string TILE_MOUSE_ENTER = "TILE_MOUSE_ENTER";
    public static readonly string TILE_MOUSE_EXIT = "TILE_MOUSE_EXIT";

    public Preset SelectedHighlightGlow;
    public Preset OverHighlightGlow;

    public int x;
    public int y;

    private SpriteGlow.SpriteGlowEffect spriteGlowEffect;
    private bool IsSelected = false;

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

    void OnMouseEnter()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_ENTER, new Point(x, y));
        HighlightOn();
    }

    void OnMouseExit()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_EXIT, new Point(x, y));
        HighlightOff();
    }

    public void SelectedHighlightOn()
    {
        IsSelected = true;
        SelectedHighlightGlow.ApplyTo(spriteGlowEffect);
    }

    public void SelectedHighlightOff()
    {
        IsSelected = false;
        Destroy(spriteGlowEffect);
    }

    public void HighlightOn()
    {
        if (!IsSelected)
        {
            spriteGlowEffect = gameObject.AddComponent(typeof(SpriteGlow.SpriteGlowEffect)) as SpriteGlow.SpriteGlowEffect;
            OverHighlightGlow.ApplyTo(spriteGlowEffect);
        }
    }

    public void HighlightOff()
    {
        if (!IsSelected)
        {
            Destroy(spriteGlowEffect);
        }
    }
}
