using System.Collections.Generic;
using UnityEngine;

public class ReachChecker : MonoBehaviour
{
    private Tile[,] Tiles;
    private List<Tile> TilesForCheck = new List<Tile>();
    private List<Point> ResultedPoints = new List<Point>();

    private int Width;
    private int Height;
    private int Distance;

    public ReachChecker(int width, int height)
    {
        this.Width = width;
        this.Height = height;

        this.Tiles = new Tile[width + 1, width + 1];

        for (int x = 1; x <= width; x++)
        {
            for (int y = 1; y <= height; y++)
            {
                var tile = new Tile(x, y);
                this.Tiles[x, y] = tile;
            }
        }
    }

    public void AddBlocker(Point point, bool canWalkThrought = false)
    {
        var tile = Tiles[point.x, point.y];
        tile.canWalkThroughtIt = canWalkThrought;
        tile.canWalkToIt = false;
    }

    public List<Point> CheckReach(Point point, int distance)
    {
        this.Distance = distance;
        var tile = Tiles[point.x, point.y];
        this.TilesForCheck.Add(tile);
        tile.isChecked = true;

        this.CheckTile();

        // TODO: Щас алгоритм возвращает дублирующиеся поинты
        return this.ResultedPoints;
    }

    private void CheckTile()
    {
        if (this.TilesForCheck.Count > 0)
        {
            var tile = this.TilesForCheck[0];
            this.TilesForCheck.RemoveAt(0);

            var tileDistance = tile.distance;

            this.CheckNeighbour(tile.x - 1, tile.y, tileDistance);
            this.CheckNeighbour(tile.x + 1, tile.y, tileDistance);
            this.CheckNeighbour(tile.x, tile.y - 1, tileDistance);
            this.CheckNeighbour(tile.x, tile.y + 1, tileDistance);

            this.CheckTile();
        }
    }

    private void CheckNeighbour(int x, int y, int tileDistance)
    {
        if (x < 1 || y < 1 || x > this.Width || y > this.Height)
        {
            return;
        }

        var tile = Tiles[x, y];

        if (!tile.isChecked && tileDistance + 1 <= this.Distance)
        {
            if (tile.canWalkToIt || tile.canWalkThroughtIt)
            {
                tile.isChecked = true;
                tile.distance = tileDistance + 1;
                this.TilesForCheck.Add(tile);

                if (tile.canWalkToIt)
                {
                    this.ResultedPoints.Add(new Point(x, y));
                }
            }
        }
    }

    private class Tile
    {

        public bool canWalkThroughtIt = true;
        public bool canWalkToIt = true;

        public int x;
        public int y;

        public bool isChecked = false;
        public int distance = 0;

        public Tile(int x, int y)
        {
            this.x = x;
            this.y = y;
        }
    }
}
