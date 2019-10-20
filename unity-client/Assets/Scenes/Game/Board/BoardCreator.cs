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
    public static readonly string TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD = "TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD";
    public static readonly string TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD = "TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD";
    public static readonly string CLICKED_ON_VOID_TILE = "CLICKED_ON_VOID_TILE";

    public int Width;
    public int Height;

    public GameObject TilePrefab;
    public GameObject UnitPrefab;
    public GameObject AreaPrefab;

    public List<CardDisplay> allyHeroes = new List<CardDisplay>();

    private GameObject[,] Tiles;
    private GameObject[,] Units;
    private GameObject[,] Areas;

    private float tileWidth;
    private float tileHeight;

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

        Point position = GetUnitPosition(unitDisplay);
        Units[position.x, position.y] = null;

        Destroy(unitDisplay.gameObject);
    }

    public GameObject GetTileByUnit(GameObject card)
    {
        UnitDisplay unitDisplay = card.GetComponent<UnitDisplay>();

        Point unitPosition = GetUnitPosition(unitDisplay);

        return Tiles[unitPosition.x, unitPosition.y];
    }

    public bool CheckCardsAdjacency(GameObject firstCard, GameObject secondCard)
    {
        Point firstCardPoint = GetUnitPosition(firstCard.GetComponent<UnitDisplay>());
        Point secondCardPoint = GetUnitPosition(secondCard.GetComponent<UnitDisplay>());

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
        Point p = GetUnitPosition(unitDisplay);
        return PositionAdjacentToEnemy(p);
    }

    public void ShowPathReach(UnitDisplay unitDisplay)
    {
        var reachChecker = this.CreateReachChecker();

        Point unitPosition = this.GetUnitPosition(unitDisplay);
        var points = reachChecker.CheckReach(unitPosition, unitDisplay.CardData.currentMovingPoints);

        this.HighlightPathInTilesByPoints(points);
    }

    public void ShowPushReach(UnitDisplay attacker, UnitDisplay attacked)
    {
        var reachChecker = this.CreateReachChecker(true, true, true);

        Point unitPosition = this.GetUnitPosition(attacked);
        var points = reachChecker.CheckReach(unitPosition, attacker.CardData.abilities.push.range);

        this.HighlightPathInTilesByPoints(points);
    }

    public void ShowPlacesToCastCreatures()
    {
        List<Point> positionsInRadius = new List<Point>();
        foreach (var hero in this.allyHeroes)
        {
            if (hero.cardData.alive)
            {
                Point position = this.GetUnitPosition(hero.UnitDisplay);

                List<Point> p = FindPointsInRadius(position, 2);

                positionsInRadius.AddRange(p);
            }
        }
        
        List<Point> positions = new List<Point>();
        foreach (var position in positionsInRadius)
        {
            bool unitOcuppiedTile = this.Units[position.x, position.y] != null;

            var area = this.Areas[position.x, position.y];
            bool areaOccupiedTile = false;
            if (area != null)
            {
                var areaDisplay = area.GetComponent<AreaDisplay>();
                areaOccupiedTile = !areaDisplay.areaData.canUnitsWalkThoughtIt;
            }

            bool positionAdjacentToEnemy = this.PositionAdjacentToEnemy(position);

            if (!unitOcuppiedTile && !areaOccupiedTile && !positionAdjacentToEnemy)
            {
                positions.Add(position);
            }
        }

        this.HighlightPathInTilesByPoints(positions);
    }

    public void ShowRangeAttackReach(UnitDisplay attacker, Point fromPosition)
    {
        var points = this.GetPositionsForRangeAttack(attacker, fromPosition);

        this.HighlightRangeAttackReachInTilesByPoints(points);

        List<UnitDisplay> units = this.GetUnitsByPoints(points);

        foreach (var unit in units)
        {
            if (!unit.CardDisplay.IsAlly)
            {
                unit.ShowTarget();
            }
        }
    }

    private List<Point> GetPositionsForRangeAttack(UnitDisplay attacker, Point fromPosition)
    {
        var radiusPoints = this.FindPointsInRadius(fromPosition, attacker.CardData.abilities.range.range, attacker.CardData.abilities.range.minRange);

        var points = new List<Point>();
        foreach (var radiusPoint in radiusPoints)
        {
            var canUnitStandsAtThisPoint = true;
            var area = this.Areas[radiusPoint.x, radiusPoint.y];
            if (area != null && !area.GetComponent<AreaDisplay>().areaData.canUnitsWalkThoughtIt)
            {
                canUnitStandsAtThisPoint = false;
            }

            var canAttackToThisPoint = this.CheckRangeAttackBetweenPoints(fromPosition, radiusPoint);

            if (canAttackToThisPoint && canUnitStandsAtThisPoint)
            {
                points.Add(radiusPoint);
            }
        }

        return points;
    }

    private List<UnitDisplay> GetUnitsByPoints(List<Point> points)
    {
        var units = new List<UnitDisplay>();
        foreach (var point in points)
        {
            var unit = GetUnitByPoint(point);
            if (unit != null)
            {
                units.Add(unit);
            }
        }

        return units;
    }

    private UnitDisplay GetUnitByPoint(Point point)
    {
        var unit = Units[point.x, point.y];
        if (unit != null)
        {
            var unitDisplay = unit.GetComponent<UnitDisplay>();
            return unitDisplay;
        }

        return null;
    }

    public void BlinkRicochetTargets(UnitDisplay unitDisplay)
    {
        Point p = GetUnitPosition(unitDisplay);

        Point[] points = new Point[] { new Point(p.x + 1, p.y), new Point(p.x - 1, p.y), new Point(p.x, p.y + 1), new Point(p.x, p.y - 1) };

        foreach (Point point in points)
        {
            UnitDisplay enemy = this.GetEnemy(point);
            if (enemy != null)
            {
                enemy.BlinkOn();
            }
        }
    }

    public void BlinkHealTargets(UnitDisplay unitDisplay, int range)
    {
        Point p = GetUnitPosition(unitDisplay);

        var radiusPoints = this.FindPointsInRadius(p, range);

        foreach (Point point in radiusPoints)
        {
            UnitDisplay ally = this.GetAlly(point);
            if (ally != null)
            {
                ally.BlinkOn();
            }
        }

        this.HighlightPathInTilesByPoints(radiusPoints);
    }

    public void RemoveAllBlinks()
    {
        RemoveAllUnitBlinks();
        RemoveAllTileBlinks();
    }

    public Point GetUnitPosition(UnitDisplay unitDisplay)
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

    public Point GetTilePosition(TileDisplay tileDispay)
    {
        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                if (Tiles[x, y] == tileDispay.gameObject)
                {
                    return new Point(x, y);
                }
            }
        }

        return null;
    }

    private void RemoveAllUnitBlinks()
    {
        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                var unit = this.Units[x, y];
                if (unit != null)
                {
                    unit.GetComponent<UnitDisplay>().BlinkOff();
                    unit.GetComponent<UnitDisplay>().HideTarget();
                }
            }
        }
    }

    private void RemoveAllTileBlinks()
    {
        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                var tile = this.Tiles[x, y];
                tile.GetComponent<TileDisplay>().RemoveBlinks();
            }
        }
    }

    private bool CheckRangeAttackBetweenPoints(Point point1, Point point2)
    {
        var points = this.PlotRangePath(point1, point2);

        points.RemoveAt(0);
        points.RemoveAt(points.Count - 1);

        foreach (var point in points)
        {
            var unit = this.Units[point.x, point.y];
            if (unit != null && !unit.GetComponent<UnitDisplay>().CardDisplay.IsAlly)
            {
                return false;
            }

            var area = this.Areas[point.x, point.y];
            if (area != null && !area.GetComponent<AreaDisplay>().areaData.canUnitsShootThoughtIt)
            {
                return false;
            }
        }

        return true;
    }

    private List<Point> PlotRangePath(Point point1, Point point2)
    {
        var x1 = point1.x;
        var y1 = point1.y;
        var x2 = point2.x;
        var y2 = point2.y;

        var xDist = Math.Abs(x2 - x1);
        var yDist = Math.Abs(y2 - y1);
        var xStep = (x1 < x2 ? +1 : -1);
        var yStep = (y1 < y2 ? +1 : -1);

        var maxDist = xDist > yDist ? xDist : yDist;
        var minDist = xDist > yDist ? yDist : xDist;

        var dots = new List<Point>();

        var a = (float)minDist / (float)maxDist;
        float inc = 0;

        for (var i = 0; i <= maxDist; i++)
        {
            if (xDist > yDist)
            {
                var x = x1 + (xStep * i);
                var y = y1 + (inc * yStep);

                if (this.IsInt(inc))
                {
                    dots.Add(new Point(x, (int)Math.Round(y)));
                } else
                {
                    dots.Add(new Point(x, (int)Math.Floor(y)));
                    dots.Add(new Point(x, (int)Math.Ceiling(y)));
                }
            }
            if (xDist < yDist)
            {
                var x = x1 + (inc * xStep);
                var y = y1 + (yStep * i);

                if (this.IsInt(inc))
                {
                    dots.Add(new Point((int)Math.Round(x), y));
                } else
                {
                    dots.Add(new Point((int)Math.Floor(x), y));
                    dots.Add(new Point((int)Math.Ceiling(x), y));
                }
            }
            if (xDist == yDist)
            {
                var x = x1 + (xStep * i);
                var y = y1 + (yStep * i);

                dots.Add(new Point(x, y));

                if (i != maxDist)
                {
                    dots.Add(new Point(x + xStep, y));
                    dots.Add(new Point(x, y + yStep));
                }
            }

            inc += a;
        }

        return dots;
    }

    private bool IsInt (float number)
    {
        return (number % 1) == 0;
    }

    private bool PositionAdjacentToEnemy(Point point)
    {
        List<Point> points = this.FindPointsInRadius(point, 1);
        points.RemoveAt(0);

        foreach (var p in points)
        {
            if (this.CheckForEnemy(p))
            {
                return true;
            }
        }

        return false;
    }

    private List<Point> FindPointsInRadius(Point center, int radius, int minRadius = 1)
    {
        List<Point> pointsInRadius = new List<Point>();

        if (minRadius == 1)
        {
            pointsInRadius.Add(center);
        }

        for (int x = 1; x <= this.Width; x++)
        {
            var rangeX = Math.Abs(center.x - x);

            if (rangeX <= radius)
            {
                for (int y = 1; y <= this.Height; y++)
                {
                    if (!(center.x == x && center.y == y))
                    {
                        var rangeY = Math.Abs(center.y - y);

                        if ((rangeY + rangeX) <= radius && (rangeY + rangeX) >= minRadius)
                        {
                            pointsInRadius.Add(new Point(x, y));
                        }
                    }
                }

            }
        }

        return pointsInRadius;
    }

    private void HighlightPathInTilesByPoints(List<Point> points)
    {
        foreach (var point in points)
        {
            var tile = this.Tiles[point.x, point.y];
            tile.GetComponent<TileDisplay>().ShowPathReach();
        }
    }

    private void HighlightRangeAttackReachInTilesByPoints(List<Point> points)
    {
        foreach (var point in points)
        {
            var tile = this.Tiles[point.x, point.y];
            tile.GetComponent<TileDisplay>().ShowRangeAttackReach();
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

    private bool CheckForEnemy(Point point)
    {
        return (GetEnemy(point) != null);
    }

    private UnitDisplay GetEnemy(Point point)
    {
        var unitDisplay = this.GetUnit(point);

        if (!unitDisplay)
        {
            return null;
        }

        if (!unitDisplay.CardDisplay.IsAlly)
        {
            return unitDisplay;
        }
        return null;
    }

    private UnitDisplay GetAlly(Point point)
    {
        var unitDisplay = this.GetUnit(point);

        if (!unitDisplay)
        {
            return null;
        }

        if (unitDisplay.CardDisplay.IsAlly)
        {
            return unitDisplay;
        }
        return null;
    }

    private UnitDisplay GetUnit(Point point)
    {
        if (point.x < 1 || point.y < 1 || point.x > this.Width || point.y > this.Height)
        {
            return null;
        }

        var unit = this.Units[point.x, point.y];
        if (!unit)
        {
            return null;
        }

        return unit.GetComponent<UnitDisplay>();
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
        Point oldPosition = GetUnitPosition(unitDisplay);

        Units[oldPosition.x, oldPosition.y] = null;
        Units[position.x, position.y] = unitDisplay.gameObject as GameObject;
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
        GameObject unit = this.Units[position.x, position.y];

        if (unit)
        {
            UnitDisplay unitDisplay = unit.GetComponent<UnitDisplay>();

            Unibus.Dispatch<UnitDisplay>(UNIT_MOUSE_ENTER_ON_BOARD, unitDisplay);
        } else
        {
            TileDisplay tileDisplay = this.Tiles[position.x, position.y].GetComponent<TileDisplay>();
            Unibus.Dispatch<TileDisplay>(TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, tileDisplay);
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
        else
        {
            TileDisplay tileDisplay = this.Tiles[position.x, position.y].GetComponent<TileDisplay>();
            Unibus.Dispatch<TileDisplay>(TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, tileDisplay);
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

public class AbilityActivated
{
    public CardDisplay cardDisplay;
    public Ability ability;
}
