using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnibusEvent;

public class ManaPool : StackDisplay
{
    private Dictionary<CardDisplay, GameObject> cardDisplayToMana = new Dictionary<CardDisplay, GameObject>();

    private void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_TAPPED, OnCardChanged);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_UNTAPPED, OnCardChanged);
    }

    override public void AddCard(CardDisplay cardDisplay)
    {
        base.AddCard(cardDisplay);

        cardDisplay.gameObject.SetActive(false);

        GameObject manaPrefab = Resources.Load<GameObject>("Mana");
        GameObject mana = (GameObject)Instantiate(manaPrefab, this.transform);
        mana.transform.SetParent(this.transform);

        this.CalcMana(cardDisplay, mana);
        this.cardDisplayToMana.Add(cardDisplay, mana);
    }

    private void CalcMana(CardDisplay cardDisplay, GameObject mana)
    {
        Debug.Log(cardDisplay.cardData.tapped);
        mana.transform.Find("Mana").gameObject.SetActive(!cardDisplay.cardData.tapped);
    }

    private void OnCardChanged(CardDisplay cardDisplay)
    {
        GameObject mana;
        this.cardDisplayToMana.TryGetValue(cardDisplay, out mana);

        if (mana != null)
        {
            this.CalcMana(cardDisplay, mana);
        }
    }
}
