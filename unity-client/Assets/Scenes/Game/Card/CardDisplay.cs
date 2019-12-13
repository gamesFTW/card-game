using System.Collections;
using TMPro;
using UnibusEvent;
using UnityEngine;
using DG.Tweening;
using System.Collections.Generic;

public class CardDisplay : MonoBehaviour
{
    public UnitDisplay UnitDisplay;
	public CardData cardData;

    public Transform Placeholder;

    public GameObject artwork;

	public TextMeshPro handHpText;
	public TextMeshPro nameText;
	public TextMeshPro manaText;
	public TextMeshPro damageText;
    public TextMeshPro currentHpText;
    public TextMeshPro maxHpText;
    public TextMeshPro currentMovingPoints;

    public bool isMovedAtInitialPosition = false;

    public Dictionary<string, SoundData> sounds = new Dictionary<string, SoundData>();

    public static readonly string CARD_PLAY_AS_MANA = "CARD_PLAY_AS_MANA";
    public static readonly string CARD_CLICKED = "CARD_CLICKED";
    public static readonly string CARD_MOUSE_ENTER = "CARD_MOUSE_ENTER";
    public static readonly string CARD_MOUSE_EXIT = "CARD_MOUSE_EXIT";
    public static readonly string CARD_DIED = "CARD_DIED";
    public static readonly string CARD_TAPPED = "CARD_TAPPED";
    public static readonly string CARD_UNTAPPED = "CARD_UNTAPPED";

    private CardAbilitiesDescription cardAbilitiesDescription;
    private CardCollider cardCollider;

    private bool IsSelected = false;
    private bool IsZoomed = false;
    private Vector3 scale;

    private float xOffset = 0;

    private GameObject overGlowObject;
    private GameObject selectedGlowObject;
    private GameObject cardBaseBlack;
    private GameObject convertToManaButton;
    private Transform container;

    private ViewMode viewMode = ViewMode.defaultView;
    private enum ViewMode
    {
        defaultView,
        playerHandView,
        tableView
    }

    public int CurrentHp
    {
        get { return cardData.currentHp; }
        set {
            int hpDifference = value - cardData.currentHp;

            cardData.currentHp = value;

            currentHpText.text = value.ToString();

            if (this.UnitDisplay)
            {
                this.Shake();

                UnityEngine.Color color;
                if (hpDifference == 0)
                {
                    color = UnityEngine.Color.white;
                }
                else if (hpDifference > 0)
                {
                    color = UnityEngine.Color.green;
                }
                else
                {
                    color = UnityEngine.Color.red;
                }

                this.UnitDisplay.ShowToolTip(System.Math.Abs(hpDifference).ToString(), color);
            }
        }
    }

    public int Damage
    {
        get { return cardData.damage; }
        set {
            cardData.damage = value;
            damageText.text = cardData.damage.ToString();
        }
    }

    public int CurrentMovingPoints
    {
        get { return cardData.currentMovingPoints; }
        set
        {
            cardData.currentMovingPoints = value;
            currentMovingPoints.text = value.ToString();
        }
    }

    public bool UsedInThisTurnBlockAbility
    {
        get { return cardData.abilities.block.usedInThisTurn; }
        set
        {
            cardData.abilities.block.usedInThisTurn = value;
            this.UnitDisplay.RedrawAbilisiesStatus();
        }
    }

    public bool UsedInThisTurnEvasionAbility
    {
        get { return cardData.abilities.evasion.usedInThisTurn; }
        set
        {
            cardData.abilities.evasion.usedInThisTurn = value;
            this.UnitDisplay.RedrawAbilisiesStatus();
        }
    }

    public bool BlockedInBeginningOfTurn
    {
        get { return cardData.abilities.range.blockedInBeginningOfTurn; }
        set
        {
            cardData.abilities.range.blockedInBeginningOfTurn = value;
            this.cardAbilitiesDescription.FillDescription();

            if (cardData.abilities.range.blockedInBeginningOfTurn)
            {
                this.UnitDisplay.ShowToolTip("Can't shoot", UnityEngine.Color.red);
            } else
            {
                this.UnitDisplay.ShowToolTip("Can shoot", UnityEngine.Color.white);
            }
        }
    }

    public int PoisonedDamage
    {
        get { return cardData.negativeEffects.poisoned.damage; }
        set
        {
            if (value == 0)
            {
                cardData.negativeEffects.poisoned = null;
            } else
            {
                var poisonEffect = new PoisonEffect();
                poisonEffect.damage = value;
                cardData.negativeEffects.poisoned = poisonEffect;
                this.UnitDisplay.ShowToolTip("Poisoned", UnityEngine.Color.red);
            }

            this.cardAbilitiesDescription.FillDescription();
        }
    }

    public int DamageCursedDamage
    {
        get { return cardData.negativeEffects.damageCursed.damageReduction; }
        set
        {
            if (value == 0)
            {
                cardData.negativeEffects.damageCursed = null;
            } else
            {
                var effect = new DamageCurseEffect();
                effect.damageReduction = value;
                cardData.negativeEffects.damageCursed = effect;
                this.UnitDisplay.ShowToolTip("Cursed", UnityEngine.Color.red);
            }

            this.cardAbilitiesDescription.FillDescription();
        }
    }

    public int NumberOfAiming
    {
        get { return cardData.abilities.aiming.numberOfAiming; }
        set
        {
            cardData.abilities.aiming.numberOfAiming = value;
            this.UnitDisplay.RedrawAbilisiesStatus();
            this.cardAbilitiesDescription.FillDescription();
        }
    }

    public bool IsAlly
    {
        get { return this.cardData.ownerId == GameState.mainPlayerId; }
    }

    public void ChangeHpByHPAura (int newHP, int hpAuraBuff)
    {
        int hpDifference = newHP - cardData.currentHp;

        cardData.currentHp = newHP;

        currentHpText.text = newHP.ToString();

        if (this.UnitDisplay)
        {
            UnityEngine.Color color;
            if (hpDifference == 0)
            {

            }
            else { 
                if (hpDifference > 0)
                {
                    color = UnityEngine.Color.green;
                }
                else
                {
                    color = UnityEngine.Color.red;
                }

                this.Shake();
                this.UnitDisplay.ShowToolTip(System.Math.Abs(hpDifference).ToString() + " (hp aura)", color);
            }
        }

        if (hpAuraBuff > 0)
        {
            HPAuraBuffEffect hpAuraBuffEffect = new HPAuraBuffEffect();
            hpAuraBuffEffect.hpBuff = hpAuraBuff;
            this.cardData.positiveEffects.hpAuraBuff = hpAuraBuffEffect;
        }
        else
        {
            this.cardData.positiveEffects.hpAuraBuff = null;
        }

        this.cardAbilitiesDescription.FillDescription();
    }

    private void Awake()
    {
        this.cardAbilitiesDescription = this.GetComponent<CardAbilitiesDescription>();
        this.container = this.transform.Find("Container");
        this.cardCollider = this.transform.Find("Container/Collider").GetComponent<CardCollider>();

        this.cardBaseBlack = this.transform.Find("Container/CardBaseBlack").gameObject;
        this.overGlowObject = this.transform.Find("Container/Front/OverGlow").gameObject;
        this.selectedGlowObject = this.transform.Find("Container/Front/SelectedGlow").gameObject;
        this.convertToManaButton = this.transform.Find("Container/Front/ConvertToManaButton").gameObject;
    }

    private void Start () 
    {
        nameText.text = cardData.name;

		manaText.text = cardData.manaCost.ToString();
        damageText.text = cardData.damage.ToString();
        maxHpText.text = cardData.maxHp.ToString();
        currentHpText.text = cardData.currentHp.ToString();
        currentMovingPoints.text = cardData.currentMovingPoints.ToString();
        handHpText.text = cardData.maxHp.ToString();

        StartCoroutine(LoadSprite());

        if (this.cardData.sounds != null)
        {
            foreach (KeyValuePair<string, SoundData> entry in this.cardData.sounds)
            {
                SoundData soundData = entry.Value;
                this.sounds.Add(soundData.soundName, soundData);
            }
        }

        this.convertToManaButton.GetComponent<MouseHandlers>().MouseClickHandler = this.OnConvertToManaButtonClick;
    }

    private void Update()
    {
        if (this.cardCollider.CurrentCollider)
        {
            var screenBounds = Camera.main.ScreenToWorldPoint(
                new Vector3(Screen.width, Screen.height, Camera.main.transform.position.z)
            );

            if (this.cardCollider.CurrentCollider.bounds.max.x > screenBounds.x)
            {
                var difference = this.cardCollider.CurrentCollider.bounds.max.x - screenBounds.x;
                this.xOffset += difference;
                this.transform.position -= new Vector3(difference, 0, 0);
            }
        }

        UpdateZIndex();
    }

    public void SwitchToDefaultZoomView()
    {
        if (viewMode != ViewMode.defaultView)
        {
            this.ZoomOut();

            this.transform.position += new Vector3(xOffset, 0, 0);
            this.xOffset = 0;

            this.container.localPosition = new Vector3(0, 0, 0);
            //card.transform.DOMove(card.transform.position - new Vector3(0, 3.4F, 0), 3);

            this.cardCollider.EnableDefaultCollider();

            this.convertToManaButton.SetActive(false);

            this.cardAbilitiesDescription.HideDescription();
            this.cardAbilitiesDescription.HideAbilityDescription();

            this.viewMode = ViewMode.defaultView;
        }
    }

    public void SwitchToPlayerHandZoomedView()
    {
        if (viewMode != ViewMode.playerHandView)
        {
            this.ZoomIn(2f);

            this.container.localPosition += new Vector3(0, 110F, 0);
            //card.transform.DOMove(card.transform.position + new Vector3(0, 3.4F, 0), 3);

            this.cardCollider.EnableHandCollider();

            this.convertToManaButton.SetActive(true);

            this.cardAbilitiesDescription.ShowDescription();

            this.viewMode = ViewMode.playerHandView;
        }
    }

    public void SwitchToTableZoomedView()
    {
        if (viewMode != ViewMode.tableView)
        {
            this.ZoomIn(3f);
            this.cardCollider.EnableTableCollider();
            this.cardAbilitiesDescription.ShowDescription();
            this.viewMode = ViewMode.tableView;
        }
    }

    public void HideCurrentHp()
    {
        this.container.Find("Front/HandHp").gameObject.SetActive(false);
        this.container.Find("Front/TableHp").gameObject.SetActive(true);
    }

    public void ShowCurrentHp()
    {
        this.container.Find("Front/HandHp").gameObject.SetActive(true);
        this.container.Find("Front/TableHp").gameObject.SetActive(false);
    }

    public void MoveAtInitialPosition(Vector3 position, Vector3 scale) {
        this.Move(position, scale, 0);

        isMovedAtInitialPosition = true;
    }

    public void Move(Vector3 position, Vector3 scale, float time = 1) {
        this.scale = scale;

        this.transform.DOScale(scale, time);
        this.transform.DOMove(position, time);
    }

    public void FaceUp() {
        this.transform.Find("Container/Back").gameObject.SetActive(false);
        this.transform.Find("Container/Front").gameObject.SetActive(true);
    }

    public void FaceDown() {
        this.transform.Find("Container/Back").gameObject.SetActive(true);
        this.transform.Find("Container/Front").gameObject.SetActive(false);
    }

    public void Tap()
    {
        cardData.tapped = true;

        if (this.UnitDisplay)
        {
            this.UnitDisplay.Tap();
        }

        this.cardBaseBlack.SetActive(true);

        this.Shake();
        Unibus.Dispatch(CARD_TAPPED, this);
    }

    public void Untap()
    {
        cardData.tapped = false;

        if (this.UnitDisplay)
        {
            this.UnitDisplay.Untap();
        }

        this.cardBaseBlack.SetActive(false);
        Unibus.Dispatch(CARD_UNTAPPED, this);
    }

    public void Kill()
    {
        this.cardData.alive = false;
        Unibus.Dispatch(CARD_DIED, this);
        this.ZoomOut();
        this.Unselect();
        this.OverHighlightOff();
    }
    
    public void Select()
    {
        IsSelected = true;
        this.selectedGlowObject.SetActive(true);
        this.overGlowObject.SetActive(false);

        if (this.UnitDisplay)
        {
            this.UnitDisplay.SelectedHighlightOn();
        }
    }

    public void Unselect()
    {
        IsSelected = false;
        this.selectedGlowObject.SetActive(false);

        if (this.UnitDisplay)
        {
            this.UnitDisplay.SelectedHighlightOff();
        }
    }

    public void OverHighlightOn()
    {
        this.cardAbilitiesDescription.ShowDescription();

        if (!IsSelected)
        {
            this.overGlowObject.SetActive(true);
            this.UnitDisplay.OverHighlightOn();
        }
    }

    public void OverHighlightOff()
    {
        this.cardAbilitiesDescription.HideDescription();

        if (!IsSelected)
        {
            this.overGlowObject.SetActive(false);
            this.UnitDisplay.OverHighlightOff();
        }
    }

    public void Shake()
    {
        if (this.UnitDisplay)
        {
            this.UnitDisplay.Shake();
        }
    }

    // Public only for CardCollider class
    public void CardMouseDown()
    {
        var convertToManaButtonMouseHandlers = this.convertToManaButton.GetComponent<MouseHandlers>();

        if (!convertToManaButtonMouseHandlers.mouseEnter)
        {
            OnLeftMouseClicked();
        }
    }

    // Public only for CardCollider class
    public void CardMouseEnter()
    {
        Unibus.Dispatch(CARD_MOUSE_ENTER, this);
    }

    // Public only for CardCollider class
    public void CardMouseExit()
    {
        Unibus.Dispatch(CARD_MOUSE_EXIT, this);
    }

    private void UpdateZIndex()
    {
        Vector3 position = transform.localPosition;
        float z = (float)(position.x * 0.01) - 10;

        if (IsZoomed)
        {
            z = -50;
        }

        this.transform.localPosition = new Vector3(position.x, position.y, z);
    }

    private void ZoomIn(float zoom)
    {
        this.transform.DOScale(new Vector3(this.scale.x * zoom, this.scale.y * zoom, this.scale.z * zoom), 0.2f);

        this.cardBaseBlack.SetActive(false);

        this.IsZoomed = true;
    }

    private void ZoomOut()
    {
        this.transform.DOScale(this.scale, 0.2f);

        if (cardData.tapped)
        {
            this.cardBaseBlack.SetActive(true);
        }

        this.IsZoomed = false;
    }

    private void OnLeftMouseClicked()
    {
        Unibus.Dispatch(CARD_CLICKED, this);
    }

    private IEnumerator LoadSprite()
    {
        WWW www = new WWW(Config.LOBBY_SERVER_URL + cardData.image);
        yield return www;

        Sprite sprite = Sprite.Create(www.texture, new Rect(0, 0, www.texture.width, www.texture.height), new Vector2(0.5F, 0.5F));

        artwork.GetComponent<SpriteRenderer>().sprite = sprite;
    }

    private void OnConvertToManaButtonClick()
    {
        Unibus.Dispatch(CARD_PLAY_AS_MANA, this);
    }
}
