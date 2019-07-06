using UnityEngine;
using UnibusEvent;
using TMPro;
using DG.Tweening;

public class TileDisplay : MonoBehaviour
{
    public static readonly string TILE_MOUSE_LEFT_CLICK = "TILE_MOUSE_LEFT_CLICK";
    public static readonly string TILE_MOUSE_ENTER = "TILE_MOUSE_ENTER";
    public static readonly string TILE_MOUSE_EXIT = "TILE_MOUSE_EXIT";

    public TextMeshPro text;

    public int x;
    public int y;

    private bool IsPathOn = false;
    private GameObject overGlowObject;
    private GameObject path;

    private Sequence sequence;

    void Start()
    {
        this.overGlowObject = this.transform.Find("OverGlow").gameObject;
        this.path = this.transform.Find("Path").gameObject;
    }

    void Update()
    {

    }

    public void SetText(string text)
    {
        this.text.text = text;
    }

    public void HighlightOn()
    {
        this.overGlowObject.SetActive(true);
    }

    public void HighlightOff()
    {
        this.overGlowObject.SetActive(false);
    }

    public void PathOn()
    {
        if (this.IsPathOn)
        {
            return;
        }

        var spriteRenderer = this.path.GetComponent<BlinkedSpriteRenderer>();
        spriteRenderer.BlinkOn();

        this.path.SetActive(true);
    }

    public void PathOff()
    {
        var spriteRenderer = this.path.GetComponent<BlinkedSpriteRenderer>();
        spriteRenderer.BlinkOff();

        this.path.SetActive(false);
    }

    void OnMouseDown()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_LEFT_CLICK, new Point(x, y));
    }

    void OnMouseEnter()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_ENTER, new Point(x, y));
    }

    void OnMouseExit()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_EXIT, new Point(x, y));
    }
}
