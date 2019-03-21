using UnityEngine;
using UnibusEvent;

public class BoardCreator : MonoBehaviour
{
    public static readonly string UNIT_CLICKED_ON_BOARD = "UNIT_CLICKED_ON_BOARD";
    public static readonly string UNIT_MOUSE_ENTER_ON_BOARD = "UNIT_MOUSE_ENTER_ON_BOARD";
    public static readonly string UNIT_MOUSE_EXIT_ON_BOARD = "UNIT_MOUSE_EXIT_ON_BOARD";
    public static readonly string CLICKED_ON_VOID_TILE = "CLICKED_ON_VOID_TILE";

    public int Width;
    public int Height;

    public GameObject TilePrefab;
    public GameObject UnitPrefab;

    private GameObject[,] Tiles;
    private GameObject[,] Units;

    private float tileWidth;
    private float tileHeight;

    public static Sprite fat;
    public static Sprite boar;
    public static Sprite goblin;
    public static Sprite hero;
    public static Sprite reptile;
    public static Sprite skeleton;

    public void CreateUnit(CardDisplay cardDisplay, Point position)
    {
        GameObject unit = Instantiate<GameObject>(UnitPrefab, this.transform);
        unit.transform.SetParent(this.transform);
        unit.transform.localPosition = PointerToIcometric(position, tileWidth, tileHeight);

        UnitDisplay unitDisplay = unit.GetComponent<UnitDisplay>();
        unitDisplay.CardData = cardDisplay.cardData;
        unitDisplay.CardDisplay = cardDisplay;
        cardDisplay.UnitDisplay = unitDisplay;

        Units[position.x, position.y] = unit as GameObject;
    }

    public void MoveUnit(CardDisplay cardDisplay, Point position)
    {
        UnitDisplay unitDisplay = cardDisplay.UnitDisplay;

        unitDisplay.transform.localPosition = PointerToIcometric(position, tileWidth, tileHeight);

        Point oldPosition = GetUnitsPosition(unitDisplay);

        Units[oldPosition.x, oldPosition.y] = null;
        Units[position.x, position.y] = unitDisplay.gameObject as GameObject;
    }

    public void KillUnit(CardDisplay cardDisplay)
    {
        UnitDisplay unitDisplay = cardDisplay.UnitDisplay;

        Point position = GetUnitsPosition(unitDisplay);
        Units[position.x, position.y] = null;

        Destroy(unitDisplay.gameObject);
    }

    public GameObject GetTileByUnit(GameObject card)
    {
        UnitDisplay unitDisplay = card.GetComponent<UnitDisplay>();

        Debug.Log(unitDisplay);

        Point unitPosition = GetUnitsPosition(unitDisplay);

        return Tiles[unitPosition.x, unitPosition.y];
    }

    private void Awake()
    {
        fat = Resources.Load<Sprite>("Sprites/Units/fat");
        boar = Resources.Load<Sprite>("Sprites/Units/boar");
        goblin = Resources.Load<Sprite>("Sprites/Units/goblin");
        hero = Resources.Load<Sprite>("Sprites/Units/hero");
        reptile = Resources.Load<Sprite>("Sprites/Units/reptile");
        skeleton = Resources.Load<Sprite>("Sprites/Units/skeleton");

        CreateTiles();
    }

    private void Start()
    {
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_LEFT_CLICK, OnTileMouseLeftClick);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_ENTER, OnTileMouseEnter);
        Unibus.Subscribe<Point>(TileDisplay.TILE_MOUSE_EXIT, OnTileMouseExit);
    }

    private void CreateTiles ()
    {
        Tiles = new GameObject[Width + 1, Height + 1];
        Units = new GameObject[Width + 1, Height + 1];

        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                GameObject tile = Instantiate<GameObject>(TilePrefab, this.transform);
                tile.transform.SetParent(this.transform);

                RectTransform rt = (RectTransform)tile.transform;
                tileWidth = rt.rect.width;
                tileHeight = rt.rect.height;

                // Show text
                //TextMeshPro text = tile.transform.Find("Text").gameObject.GetComponent<TextMeshPro>();
                //text.SetText(x.ToString() + ";" + y.ToString());

                tile.transform.localPosition = PointerToIcometric(new Point(x, y), tileWidth, tileHeight);

                TileDisplay tileDisplay = tile.GetComponent<TileDisplay>();
                tileDisplay.x = x;
                tileDisplay.y = y;

                Tiles[x, y] = tile as GameObject;
            }
        }
    }

    private Point GetUnitsPosition(UnitDisplay unitDisplay)
    {
        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                if (Units[x, y] == unitDisplay.gameObject)
                {
                    return new Point(x, y);
                }
            }
        }

        return null;
    }

    void OnTileMouseLeftClick(Point position)
    {
        GameObject unit = Units[position.x, position.y];

        if (unit)
        {
            UnitDisplay unitDisplay = unit.GetComponent<UnitDisplay>();

            Unibus.Dispatch<UnitDisplay>(UNIT_CLICKED_ON_BOARD, unitDisplay);
        } else
        {
            Unibus.Dispatch<Point>(CLICKED_ON_VOID_TILE, position);
        }
    }

    void OnTileMouseEnter(Point position)
    {
        GameObject unit = Units[position.x, position.y];

        if (unit)
        {
            UnitDisplay unitDisplay = unit.GetComponent<UnitDisplay>();

            Unibus.Dispatch<UnitDisplay>(UNIT_MOUSE_ENTER_ON_BOARD, unitDisplay);
        }
    }

    void OnTileMouseExit(Point position)
    {
        GameObject unit = Units[position.x, position.y];

        if (unit)
        {
            UnitDisplay unitDisplay = unit.GetComponent<UnitDisplay>();

            Unibus.Dispatch<UnitDisplay>(UNIT_MOUSE_EXIT_ON_BOARD, unitDisplay);
        }
    }

    Vector3 PointerToIcometric(Point position, float tileWidth, float tileHeight)
    {
        float x = position.x;
        float y = position.y;

        return new Vector2(
            (x - y) * (tileWidth / 2),
            (x + y) * (tileHeight / 2)
        );
    }
}
