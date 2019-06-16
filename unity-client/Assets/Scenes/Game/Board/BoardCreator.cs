using UnityEngine;
using UnibusEvent;
using System;
using DG.Tweening;
using System.Collections.Generic;

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
    public GameObject AreaPrefab;

    private GameObject[,] Tiles;
    private GameObject[,] Units;
    private GameObject[,] Areas;

    private float tileWidth;
    private float tileHeight;

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

    public void CreateArea(AreaData areaData)
    {
        GameObject area = Instantiate<GameObject>(AreaPrefab, this.transform);
        area.transform.SetParent(this.transform);
        area.transform.localPosition = PointerToIcometric(new Point(areaData.x, areaData.y), tileWidth, tileHeight);

        var areaDispay = area.GetComponent<AreaDisplay>();
        areaDispay.areaData = areaData;
        areaDispay.Init();

        Areas[areaData.x, areaData.y] = area as GameObject;
    }

    public void MoveUnit(CardDisplay cardDisplay, Point position, Point[] path)
    {
        UnitDisplay unitDisplay = cardDisplay.UnitDisplay;
        List<Vector3> waypoints = new List<Vector3>();

        foreach (var point in path)
        {
            waypoints.Add(PointerToIcometric(point, tileWidth, tileHeight));
        }
      
        unitDisplay.transform.DOLocalPath(waypoints.ToArray(), 0.3f * waypoints.Count);

        this.UpdatePositions(unitDisplay, position);
    }

    public void PushUnit(CardDisplay cardDisplay, Point position)
    {
        UnitDisplay unitDisplay = cardDisplay.UnitDisplay;

        unitDisplay.transform.DOLocalJump(PointerToIcometric(position, tileWidth, tileHeight), 0.5f, 1, 0.5f);

        this.UpdatePositions(unitDisplay, position);
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

        Point unitPosition = GetUnitsPosition(unitDisplay);

        return Tiles[unitPosition.x, unitPosition.y];
    }

    public bool CheckCardsAdjacency(GameObject firstCard, GameObject secondCard)
    {
        Point firstCardPoint = GetUnitsPosition(firstCard.GetComponent<UnitDisplay>());
        Point secondCardPoint = GetUnitsPosition(secondCard.GetComponent<UnitDisplay>());

        int xDistance = Math.Abs(firstCardPoint.x - secondCardPoint.x);
        int yDistance = Math.Abs(firstCardPoint.y - secondCardPoint.y);

        if (xDistance + yDistance < 2)
        {
            return true;
        }

        return false;
    }

    public bool UnitHaveRicochetTargetNearby(UnitDisplay unitDisplay)
    {
        Point p = GetUnitsPosition(unitDisplay);

        if (this.CheckForEnemy(p.x + 1, p.y) || this.CheckForEnemy(p.x - 1, p.y) || this.CheckForEnemy(p.x, p.y + 1) || this.CheckForEnemy(p.x, p.y - 1)) {
            return true;
        }

        return false;
    }

    public void ShowPathReach(UnitDisplay unitDisplay)
    {
        var reachChecker = this.CreateReachChecker();

        Point unitPosition = this.GetUnitsPosition(unitDisplay);
        var points = reachChecker.CheckReach(unitPosition, unitDisplay.CardData.currentMovingPoints);

        this.HighlightPathInTilesByPoints(points);
    }

    public void ShowPushReach(UnitDisplay attacker, UnitDisplay attacked)
    {
        var reachChecker = this.CreateReachChecker(true, true, true);

        Point unitPosition = this.GetUnitsPosition(attacked);
        var points = reachChecker.CheckReach(unitPosition, attacker.CardData.abilities.push.range);

        this.HighlightPathInTilesByPoints(points);
    }

    private void HighlightPathInTilesByPoints(List<Point> points)
    {
        foreach (var point in points)
        {
            var tile = this.Tiles[point.x, point.y];
            tile.GetComponent<TileDisplay>().PathOn();
        }
    }

    private ReachChecker CreateReachChecker(bool isCanWalkThgroughtArea = false, bool isCanWalkThgroughtEnemy = false, bool isCanWalkThgroughtAlly = true)
    {
        var reachChecker = new ReachChecker(this.Width, this.Height);

        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                var area = this.Areas[x, y];
                if (area != null)
                {
                    var areaDisplay = area.GetComponent<AreaDisplay>();

                    if (!areaDisplay.areaData.canUnitsWalkThoughtIt)
                    {
                        reachChecker.AddBlocker(new Point(x, y), isCanWalkThgroughtArea);
                    }
                }
            }
        }

        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                var unit = this.Units[x, y];
                if (unit != null)
                {
                    var cardDisplay = unit.GetComponent<UnitDisplay>().CardDisplay;

                    if (!cardDisplay.IsAlly)
                    {
                        reachChecker.AddBlocker(new Point(x, y), isCanWalkThgroughtEnemy);
                    }
                    else
                    {
                        reachChecker.AddBlocker(new Point(x, y), isCanWalkThgroughtAlly);
                    }
                }
            }
        }

        return reachChecker;
    }

    public void RemoveAllPathReach()
    {
        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                var tile = this.Tiles[x, y];
                tile.GetComponent<TileDisplay>().PathOff();
            }
        }
    }

    private bool CheckForEnemy(int x, int y)
    {
        var unit = this.Units[x, y];
        if (!unit)
        {
            return false;
        }

        var card = unit.GetComponent<UnitDisplay>().CardDisplay;
        return !card.IsAlly;
    }

    private bool checkPositionsAdjacency(Point firstPosition, Point secondPosition) {
        var xDistance = Math.Abs(firstPosition.x - secondPosition.x);
        var yDistance = Math.Abs(firstPosition.y - secondPosition.y);

        if (xDistance + yDistance< 2) {
          return true;
        }

        return false;
    }

    private void UpdatePositions(UnitDisplay unitDisplay, Point position)
    {
        Point oldPosition = GetUnitsPosition(unitDisplay);

        Units[oldPosition.x, oldPosition.y] = null;
        Units[position.x, position.y] = unitDisplay.gameObject as GameObject;
    }

    private void Awake()
    {
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
        Areas = new GameObject[Width + 1, Height + 1];

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
                tileDisplay.SetText(x + " " + y);

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
