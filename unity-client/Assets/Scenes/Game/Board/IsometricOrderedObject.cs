using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class IsometricOrderedObject: MonoBehaviour
{
    private SpriteRenderer spriteRnd;

    void Start()
    {
        spriteRnd = GetComponent<SpriteRenderer>();
    }

    void Update()
    {
        Vector2 cIndex = transform.position;
        int l = (int)(cIndex.y * 100);
        spriteRnd.sortingOrder = -l;
    }
}