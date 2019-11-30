using System.Collections.Generic;
using UnityEngine;
using UnibusEvent;
using TMPro;

public class ManaPool : StackDisplay
{
    private Transform manaContainer;
    private GameObject hint;

    private Dictionary<CardDisplay, GameObject> cardDisplayToMana = new Dictionary<CardDisplay, GameObject>();
    private List<CardDisplay> cardDisplays = new List<CardDisplay>();

    private void Awake()
    {
        this.manaContainer = this.transform.Find("ManaContainer");
        this.hint = this.transform.Find("Hint").gameObject;
    }

    private void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_TAPPED, OnCardChanged);
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_UNTAPPED, OnCardChanged);
    }

    override public void AddCard(CardDisplay cardDisplay)
    {
        base.AddCard(cardDisplay);

        GameObject manaPrefab = Resources.Load<GameObject>("Mana");
        GameObject mana = (GameObject)Instantiate(manaPrefab, this.manaContainer);
        mana.transform.SetParent(this.manaContainer);

        this.cardDisplayToMana.Add(cardDisplay, mana);
        this.cardDisplays.Add(cardDisplay);

        this.CalcMana(cardDisplay, mana);
        this.CalcManaValue();
    }

    private void CalcMana(CardDisplay cardDisplay, GameObject mana)
    {
        mana.transform.Find("Mana").gameObject.SetActive(!cardDisplay.cardData.tapped);
    }

    private void CalcManaValue()
    {
        int mana = 0;
        foreach (var cardDisplay in cardDisplays)
        {
            if (!cardDisplay.cardData.tapped)
            {
                mana++;
            }
        }

        this.transform.Find("ManaValue").GetComponent<TextMeshProUGUI>().text = mana + " / " + cardDisplays.Count;

    }

    private void OnCardChanged(CardDisplay cardDisplay)
    {
        GameObject mana;
        this.cardDisplayToMana.TryGetValue(cardDisplay, out mana);

        if (mana != null)
        {
            this.CalcMana(cardDisplay, mana);
        }

        this.CalcManaValue();
    }

    private void OnMouseEnter()
    {
        this.hint.SetActive(true);
    }

    private void OnMouseExit()
    {
        this.hint.SetActive(false);
    }
}
