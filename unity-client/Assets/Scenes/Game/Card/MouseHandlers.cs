using UnityEngine;
using System;

public class MouseHandlers : MonoBehaviour
{
    public bool mouseEnter = false;

    // skipFirstCollide нужен чтобы избежать проблемы:
    // При быстром переносе мышки между двумя CardStatusText иногда последовательность событий происходит как
    // OnCustomMouseEnter, OnCustomMouseExit и меню не открывается.
    private bool skipFirstCollide = false;

    public Action MouseClickHandler;
    public Action MouseEnterHandler;
    public Action MouseExitHandler;

    void Update()
    {
        var isCollide = false;

        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit2D[] hits = Physics2D.GetRayIntersectionAll(ray, Mathf.Infinity);
        foreach (var hit in hits)
        {
            if (hit.collider.gameObject == this.gameObject)
            {
                isCollide = true;
                if (this.mouseEnter == false && this.skipFirstCollide)
                {
                    if (this.MouseEnterHandler != null)
                    {
                        this.MouseEnterHandler();
                    }
                    
                    this.mouseEnter = true;
                }
                this.skipFirstCollide = true;

                if (Input.GetMouseButtonDown(0))
                {
                    this.MouseClickHandler();
                }
            }
        }

        if (isCollide == false && this.mouseEnter == true)
        {
            if (this.MouseExitHandler != null)
            {
                this.MouseExitHandler();
            }

            this.mouseEnter = false;
            this.skipFirstCollide = false;
        }
    }
}
