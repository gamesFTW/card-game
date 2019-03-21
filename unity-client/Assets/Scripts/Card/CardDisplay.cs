using UnityEngine;
using UnityEngine.UI;
using UnibusEvent;
using UnityEngine.EventSystems;
using UnityEditor.Presets;

public class CardDisplay : MonoBehaviour, IPointerClickHandler, IPointerEnterHandler, IPointerExitHandler
{
	public UnitDisplay UnitDisplay;
	public CardData cardData;

	public Text nameText;
	public Text descriptionText;

	public Image artworkImage;

	public Text manaText;
	public Text damageText;
    public Text currentHpText;
    public Text maxHpText;

    public Preset glowEffectValues;

    public static readonly string CARD_PLAY_AS_MANA = "CARD_PLAY_AS_MANA";
    public static readonly string CARD_SELECTED_TO_PLAY = "CARD_SELECTED_TO_PLAY";
    public static readonly string CARD_MOUSE_ENTER = "CARD_MOUSE_ENTER";
    public static readonly string CARD_MOUSE_EXIT = "CARD_MOUSE_EXIT";

    public int CurrentHp
    {
        get { return cardData.currentHp; }
        set {
            cardData.currentHp = value;
            currentHpText.text = value.ToString();
        }
    }

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
        this.transform.Rotate(0, 0, -90);
    }

    public void Untap()
    {
        cardData.tapped = false;
        this.transform.Rotate(0, 0, 90);
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        if (eventData.button == PointerEventData.InputButton.Left)
        {
            OnLeftMouseClicked();
        }
        if (eventData.button == PointerEventData.InputButton.Right)
        {
            OnRightMouseClicked();
        }
    }

    public void OnPointerEnter(PointerEventData pointerEventData)
    {
        Unibus.Dispatch(CARD_MOUSE_ENTER, this);
    }

    public void OnPointerExit(PointerEventData pointerEventData)
    {
        Unibus.Dispatch(CARD_MOUSE_EXIT, this);
    }

    // TODO ПРЕНЕСТИ В ОТДЕЛЬНЫЙ ХЕНДЛЕР
    public void highlightOn()
    {
        GameObject go = transform.Find("Front").Find("CardTemplate").gameObject;

        if (go.GetComponent<SpriteGlow.SpriteGlowEffect>() == null)
        {
            SpriteGlow.SpriteGlowEffect effect = go.AddComponent(typeof(SpriteGlow.SpriteGlowEffect)) as SpriteGlow.SpriteGlowEffect;
            glowEffectValues.ApplyTo(effect);
        }
    }

    public void highlightOff()
    {
        GameObject go = transform.Find("Front").Find("CardTemplate").gameObject;
        SpriteGlow.SpriteGlowEffect effect = go.GetComponent<SpriteGlow.SpriteGlowEffect>();
        Destroy(effect);

    }

    private void OnLeftMouseClicked()
    {
        Unibus.Dispatch(CARD_SELECTED_TO_PLAY, cardData.id);
    }

    private void OnRightMouseClicked()
    {
        Unibus.Dispatch(CARD_PLAY_AS_MANA, cardData.id);
    }
}
