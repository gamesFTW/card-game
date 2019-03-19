using UnityEngine;
using UnibusEvent;
using UnityEditor.Presets;

public class TileDisplay : MonoBehaviour
{
    public static readonly string TILE_MOUSE_LEFT_CLICK = "TILE_MOUSE_LEFT_CLICK";
    public static readonly string TILE_MOUSE_OVER = "TILE_MOUSE_OVER";
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
        Unibus.Dispatch<Point>(TILE_MOUSE_OVER, new Point(x, y));
        highlightOn();
        Debug.Log("sfsdf");
    }

    void OnMouseExit()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_EXIT, new Point(x, y));
        highlightOff();
    }

    private void highlightOn()
    {
        if (gameObject.GetComponent<SpriteGlow.SpriteGlowEffect>() == null) {
            SpriteGlow.SpriteGlowEffect effect = gameObject.AddComponent(typeof(SpriteGlow.SpriteGlowEffect)) as SpriteGlow.SpriteGlowEffect;
            glowEffectValues.ApplyTo(effect);
        }
    }

    private void highlightOff()
    {
        SpriteGlow.SpriteGlowEffect effect = gameObject.GetComponent<SpriteGlow.SpriteGlowEffect>();
        Destroy(effect);

    }

}
