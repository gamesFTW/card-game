using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CardCollider : MonoBehaviour
{
    private CardDisplay cardDisplay;

    private BoxCollider2D defaultCollider;
    private BoxCollider2D handCollider;
    private BoxCollider2D tableCollider;

    public void EnableDefaultCollider()
    {
        this.defaultCollider.enabled = true;
        this.handCollider.enabled = false;
        this.tableCollider.enabled = false;
    }

    public void EnableHandCollider()
    {
        this.defaultCollider.enabled = false;
        this.handCollider.enabled = true;
        this.tableCollider.enabled = false;
    }

    public void EnableTableCollider()
    {
        this.defaultCollider.enabled = false;
        this.handCollider.enabled = false;
        this.tableCollider.enabled = true;
    }

    void Start()
    {
        this.cardDisplay = this.transform.parent.GetComponent<CardDisplay>();

        var colliders = this.GetComponents<BoxCollider2D>();
        this.defaultCollider = colliders[0];
        this.handCollider = colliders[1];
        this.tableCollider = colliders[2];
    }

    private void OnMouseDown()
    {
        this.cardDisplay.CardMouseDown();
    }

    private void OnMouseEnter()
    {
        this.cardDisplay.CardMouseEnter();
    }

    private void OnMouseExit()
    {
        this.cardDisplay.CardMouseExit();
    }
}
