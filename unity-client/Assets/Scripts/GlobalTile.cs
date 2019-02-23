using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;

public class GlobalTile
{
    public Vector3Int LocalPlace { get; set; }

    public Vector3 WorldLocation { get; set; }

    public TileBase TileBase { get; set; }

    public Tilemap TilemapMember { get; set; }

    public string Name { get; set; }

    // Below is needed for Breadth First Searching
    public bool IsExplored { get; set; }

    public GlobalTile ExploredFrom { get; set; }

    public int Cost { get; set; }
}