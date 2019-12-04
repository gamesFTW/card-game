using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CardCollider : MonoBehaviour
{
    public BoxCollider2D CurrentCollider
    {
        get { return this._currentCollider; }
    }

    public BoxCollider2D _currentCollider;

    private CardDisplay cardDisplay;

    private BoxCollider2D defaultCollider;
    private BoxCollider2D handCollider;
    private BoxCollider2D handColliderExtended;
    private BoxCollider2D tableCollider;

    public void EnableDefaultCollider()
    {
        this._currentCollider = this.defaultCollider;
        this.defaultCollider.enabled = true;
        this.handCollider.enabled = false;
        this.handColliderExtended.enabled = false;
        this.tableCollider.enabled = false;
    }

    public void EnableHandCollider()
    {
        this._currentCollider = this.handCollider;
        this.defaultCollider.enabled = false;
        this.handCollider.enabled = true;
        this.handColliderExtended.enabled = false;
        this.tableCollider.enabled = false;
    }

    public void EnableHandColliderExtended()
    {
        this._currentCollider = this.handColliderExtended;
        this.defaultCollider.enabled = false;
        this.handCollider.enabled = false;
        this.handColliderExtended.enabled = true;
        this.tableCollider.enabled = false;
    }

    public void EnableTableCollider()
    {
        this._currentCollider = this.tableCollider;
        this.defaultCollider.enabled = false;
        this.handCollider.enabled = false;
        this.handColliderExtended.enabled = false;
        this.tableCollider.enabled = true;
    }

    void Start()
    {
        this.cardDisplay = this.transform.parent.GetComponent<CardDisplay>();

        var colliders = this.GetComponents<BoxCollider2D>();
        this.defaultCollider = colliders[0];
        this.handCollider = colliders[1];
        this.handColliderExtended = colliders[2];
        this.tableCollider = colliders[3];
        //this.tableColliderExtended = colliders[4];

        this._currentCollider = this.defaultCollider;
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
