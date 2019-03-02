using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;

public class BoardTiles : MonoBehaviour
{
    public static BoardTiles instance;
    public Tilemap Tilemap;

    public Dictionary<Vector3, GlobalTile> tiles;

    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
        }
        else if (instance != this)
        {
            Destroy(gameObject);
        }

        GetGlobalTiles();
    }

    // Use this for initialization
    private void GetGlobalTiles()
    {
        tiles = new Dictionary<Vector3, GlobalTile>();
      
        foreach (Vector3Int pos in Tilemap.cellBounds.allPositionsWithin)
        {
            var localPlace = new Vector3Int(pos.x, pos.y, pos.z);




            if (!Tilemap.HasTile(localPlace)) continue;
            Debug.Log(localPlace);
            var tile = new GlobalTile
            {
                LocalPlace = localPlace,
                WorldLocation = Tilemap.CellToWorld(localPlace),
                TileBase = Tilemap.GetTile(localPlace),
                TilemapMember = Tilemap,
                Name = localPlace.x + "," + localPlace.y,
                Cost = 1 // TODO: Change this with the proper cost from ruletile
            };

            tiles.Add(tile.WorldLocation, tile);
        }
    }
}
