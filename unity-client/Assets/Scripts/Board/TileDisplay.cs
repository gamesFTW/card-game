using UnityEngine;
using UnibusEvent;
using UnityEditor.Presets;

public class TileDisplay : MonoBehaviour
{
    public static readonly string TILE_MOUSE_LEFT_CLICK = "TILE_MOUSE_LEFT_CLICK";
    public static readonly string TILE_MOUSE_ENTER = "TILE_MOUSE_ENTER";
    public static readonly string TILE_MOUSE_EXIT = "TILE_MOUSE_EXIT";

    //public SpriteGlow.SpriteGlowEffect glowEffectValues;
    public Preset glowEffectValues;
    //public SpriteGlow.SpriteGlowEffect glowEffect;

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

    public void HighlightOn()
    {
        if (gameObject.GetComponent<SpriteGlow.SpriteGlowEffect>() == null) {
            SpriteGlow.SpriteGlowEffect effect = gameObject.AddComponent(typeof(SpriteGlow.SpriteGlowEffect)) as SpriteGlow.SpriteGlowEffect;
            glowEffectValues.ApplyTo(effect);
        }
    }

    public void HighlightOff()
    {
        SpriteGlow.SpriteGlowEffect effect = gameObject.GetComponent<SpriteGlow.SpriteGlowEffect>();
        Destroy(effect);

    }

}
