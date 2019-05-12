using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class IsometricOrderedObject: MonoBehaviour
{
    private Renderer spriteRnd;

    void Start()
    {
        spriteRnd = GetComponent<Renderer>();
    }

    void Update()
    {
        Vector2 cIndex = transform.position;
        int l = (int)(cIndex.y * 100);
        spriteRnd.sortingOrder = -l;
    }
}
