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

    private bool IsSelected = false;
    private bool IsPathOn = false;
    private GameObject overGlowObject;
    private GameObject selectedGlowObject;
    private GameObject path;

    private Sequence sequence;

    void Start()
    {
        this.overGlowObject = this.transform.Find("OverGlow").gameObject;
        this.selectedGlowObject = this.transform.Find("SelectedGlow").gameObject;
        this.path = this.transform.Find("Path").gameObject;
    }

    void Update()
    {

    }

    public void SetText(string text)
    {
        this.text.text = text;
    }

    public void SelectedHighlightOn()
    {
        IsSelected = true;
        selectedGlowObject.SetActive(true);
        this.overGlowObject.SetActive(false);
    }

    public void SelectedHighlightOff()
    {
        IsSelected = false;
        selectedGlowObject.SetActive(false);
    }

    public void HighlightOn()
    {
        if (!IsSelected)
        {
            this.overGlowObject.SetActive(true);
        }
    }

    public void HighlightOff()
    {
        if (!IsSelected)
        {
            this.overGlowObject.SetActive(false);
        }
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
        HighlightOn();
    }

    void OnMouseExit()
    {
        Unibus.Dispatch<Point>(TILE_MOUSE_EXIT, new Point(x, y));
        HighlightOff();
    }
}
