using UnityEngine;
using System;

public class CardStatusText : MonoBehaviour
{
    public string abilityDescription;

    private bool mouseEnter = false;

    // skipFirstCollide нужен чтобы избежать проблемы:
    // При быстром переносе мышки между двумя CardStatusText иногда последовательность событий происходит как
    // OnCustomMouseEnter, OnCustomMouseExit и меню не открывается.
    private bool skipFirstCollide = false;

    public Action<string> OnCustomMouseEnter;
    public Action OnCustomMouseExit;

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
                    this.OnCustomMouseEnter(this.abilityDescription);
                    this.mouseEnter = true;
                }
                this.skipFirstCollide = true;
            }
        }

        if (isCollide == false && this.mouseEnter == true)
        {
            this.OnCustomMouseExit();
            this.mouseEnter = false;
            this.skipFirstCollide = false;
        }
    }
}
