using UnityEngine;
using UnibusEvent;
using TMPro;
using DG.Tweening;

public enum BlinkColor
{
    Yellow,
    Blue,
    YellowAndBlue
}

public class TileDisplay : MonoBehaviour
{
    public static readonly string TILE_MOUSE_LEFT_CLICK = "TILE_MOUSE_LEFT_CLICK";
    public static readonly string TILE_MOUSE_ENTER = "TILE_MOUSE_ENTER";
    public static readonly string TILE_MOUSE_EXIT = "TILE_MOUSE_EXIT";

    public TextMeshPro text;

    public int x;
    public int y;

    private bool IsPathReachOn = false;
    private bool IsRangeAttackReachOn = false;
    private GameObject overGlowObject;
    private GameObject blink;

    private Sequence sequence;

    void Start()
    {
        this.overGlowObject = this.transform.Find("OverGlow").gameObject;
        this.blink = this.transform.Find("Blink").gameObject;
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

    public void ShowPathReach()
    {
        if (this.IsPathReachOn)
        {
            return;
        }

        if (this.IsRangeAttackReachOn)
        {
            this.ShowPathReachAndRangeAttackReach();
        }
        else
        {
            this.Blink(BlinkColor.Blue);
            this.IsPathReachOn = true;
        }
    }

    public void ShowRangeAttackReach()
    {
        if (this.IsRangeAttackReachOn)
        {
            return;
        }

        if (this.IsPathReachOn)
        {
            this.ShowPathReachAndRangeAttackReach();
        }
        else
        {
            this.Blink(BlinkColor.Yellow);
            this.IsRangeAttackReachOn = true;
        }
    }

    private void ShowPathReachAndRangeAttackReach()
    {
        if (this.IsPathReachOn && this.IsRangeAttackReachOn)
        {
            return;
        }

        this.Blink(BlinkColor.YellowAndBlue);

        this.IsPathReachOn = true;
        this.IsRangeAttackReachOn = true;
    }

    private void Blink(BlinkColor color = BlinkColor.Blue)
    {
        var blinkedSpriteRenderer = this.blink.GetComponent<BlinkedSpriteRenderer>();
        blinkedSpriteRenderer.BlinkOff();
        var spriteRenderer = this.blink.GetComponent<SpriteRenderer>();

        Sprite sprite = null;

        if (color == BlinkColor.Blue)
        {
            sprite = Resources.Load<Sprite>("isometric-tile-path");
            blinkedSpriteRenderer.blinkOpacityUp = 0.4f;
            blinkedSpriteRenderer.blinkOpacityDown = 0.2f;
        }
        if (color == BlinkColor.Yellow)
        {
            sprite = Resources.Load<Sprite>("isometric-tile-range-selection");
            blinkedSpriteRenderer.blinkOpacityUp = 0.4f;
            blinkedSpriteRenderer.blinkOpacityDown = 0.2f;
        }
        if (color == BlinkColor.YellowAndBlue)
        {
            sprite = Resources.Load<Sprite>("isometric-tile-range-and-path-selection");
            blinkedSpriteRenderer.blinkOpacityUp = 0.4f;
            blinkedSpriteRenderer.blinkOpacityDown = 0.2f;
        }

        spriteRenderer.sprite = sprite;

        blinkedSpriteRenderer.BlinkOn();

        this.blink.SetActive(true);
    }

    public void RemoveBlinks()
    {
        var spriteRenderer = this.blink.GetComponent<BlinkedSpriteRenderer>();
        spriteRenderer.BlinkOff();

        this.blink.SetActive(false);

        this.IsPathReachOn = false;
        this.IsRangeAttackReachOn = false;
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
