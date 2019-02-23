using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using DG.Tweening;
using UnibusEvent;

using UnityEngine.EventSystems;


public class CardDisplay : MonoBehaviour, IPointerClickHandler
{
	public CardData cardData;

	public Text nameText;
	public Text descriptionText;

	public Image artworkImage;

	public Text manaText;
	public Text damageText;
    public Text currentHpText;
    public Text maxHpText;

    public static readonly string CARD_PLAY_AS_MANA = "CARD_PLAY_AS_MANA";

    // Use this for initialization
    void Start () 
    {
		nameText.text = cardData.name;
		//descriptionText.text = cardData.description;

		//artworkImage.sprite = cardData.artwork;

		manaText.text = cardData.manaCost.ToString();
        damageText.text = cardData.damage.ToString();
        maxHpText.text = cardData.maxHp.ToString();
        currentHpText.text = cardData.currentHp.ToString();
    }

    public void FaceUp() {
        this.transform.Find("Back").gameObject.SetActive(false);
        this.transform.Find("Front").gameObject.SetActive(true);
    }

    public void FaceDown() {
        this.transform.Find("Back").gameObject.SetActive(true);
        this.transform.Find("Front").gameObject.SetActive(false);
    }

    public void Tap()
    {
        cardData.tapped = true;
        this.transform.Rotate(0, 0, 90);
    }

    public void UnTap()
    {
        cardData.tapped = false;
        this.transform.Rotate(0, 0, 0);

    }

    public void OnPointerClick(PointerEventData eventData)
    {
        if (eventData.button == PointerEventData.InputButton.Right)
        {
            OnRightMouseClicked();
        }
    }

    private void OnRightMouseClicked()
    {
        Unibus.Dispatch(CARD_PLAY_AS_MANA, cardData.id);
    }
}
