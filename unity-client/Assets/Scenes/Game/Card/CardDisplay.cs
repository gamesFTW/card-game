using System.Collections;
using TMPro;
using UnibusEvent;
using UnityEngine;
using DG.Tweening;
using System.Collections.Generic;
using UnityEngine.Networking;

public class CardDisplay : MonoBehaviour
{
    public UnitDisplay UnitDisplay;
	public CardData cardData;

    public Transform Placeholder;

    public GameObject artwork;

	public TextMeshPro nameText;

	public TextMeshPro manaText;
	public TextMeshPro damageText;
    public TextMeshPro currentHpText;
    public TextMeshPro maxHpText;
    public TextMeshPro currentMovingPoints;

    public bool isMovedAtInitialPosition = false;

    public Dictionary<string, SoundData> sounds = new Dictionary<string, SoundData>();

    public static readonly string CARD_PLAY_AS_MANA = "CARD_PLAY_AS_MANA";
    public static readonly string CARD_SELECTED_TO_PLAY = "CARD_SELECTED_TO_PLAY";
    public static readonly string CARD_MOUSE_ENTER = "CARD_MOUSE_ENTER";
    public static readonly string CARD_MOUSE_EXIT = "CARD_MOUSE_EXIT";
    public static readonly string CARD_DIED = "CARD_DIED";

    private TextMeshPro descriptionText;
    private TextMeshPro negativeEffectsText;
    private TextMeshPro positiveEffectsText;

    private bool IsSelected = false;
    private bool IsZoomed = false;
    private Vector3 scale;

    private GameObject overGlowObject;
    private GameObject selectedGlowObject;
    private GameObject descritionContainer;

    private BoxCollider2D defaultCollider;
    private BoxCollider2D handCollider;
    private BoxCollider2D tableCollider;

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
            this.FillNegativeEffects();

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

            this.FillNegativeEffects();
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

            this.FillNegativeEffects();
        }
    }

    public int NumberOfAiming
    {
        get { return cardData.abilities.aiming.numberOfAiming; }
        set
        {
            cardData.abilities.aiming.numberOfAiming = value;
            this.UnitDisplay.RedrawAbilisiesStatus();
            this.FillPositiveEffects();
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

        this.FillPositiveEffects();
    }

    // Use this for initialization
    private void Start () 
    {
        var colliders = this.GetComponents<BoxCollider2D>();
        this.defaultCollider = colliders[0];
        this.handCollider = colliders[1];
        this.tableCollider = colliders[2];

        nameText.text = cardData.name;

		manaText.text = cardData.manaCost.ToString();
        damageText.text = cardData.damage.ToString();
        maxHpText.text = cardData.maxHp.ToString();
        currentHpText.text = cardData.currentHp.ToString();
        currentMovingPoints.text = cardData.currentMovingPoints.ToString();

        StartCoroutine(LoadSprite());

        if (this.cardData.sounds != null)
        {
            foreach (KeyValuePair<string, SoundData> entry in this.cardData.sounds)
            {
                SoundData soundData = entry.Value;
                this.sounds.Add(soundData.soundName, soundData);
            }
        }

        this.overGlowObject = this.transform.Find("Front").Find("OverGlow").gameObject;
        this.selectedGlowObject = this.transform.Find("Front").Find("SelectedGlow").gameObject;
        this.descritionContainer = this.transform.Find("Front").Find("DescritionContainer").gameObject;

        this.descriptionText = descritionContainer.transform.Find("Description").GetComponent<TextMeshPro>();
        this.negativeEffectsText = descritionContainer.transform.Find("NegativeEffects").GetComponent<TextMeshPro>();
        this.positiveEffectsText = descritionContainer.transform.Find("PositiveEffects").GetComponent<TextMeshPro>();

        this.FillDescription();
        this.FillNegativeEffects();
        this.FillPositiveEffects();
    }

    private void Update()
    {
        CheckRightMouseDown();

        UpdateZIndex();
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
        this.transform.DORotate(new Vector3(0, 0, -10), 1);

        this.Shake();
    }

    public void Untap()
    {
        cardData.tapped = false;
        this.transform.DORotate(new Vector3(0, 0, 0), 1);
    }

    public void ZoomIn(float zoom)
    {
        this.transform.DOScale(new Vector3(this.scale.x * zoom, this.scale.y * zoom, this.scale.z * zoom), 0.2f);
        this.IsZoomed = true;
    }

    public void ZoomOut()
    {
        this.transform.DOScale(this.scale, 0.2f);
        this.IsZoomed = false;
    }

    public void Kill()
    {
        this.cardData.alive = false;
        Unibus.Dispatch(CARD_DIED, this);
        this.ZoomOut();
        this.Unselect();
        this.OverHighlightOff();
    }

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
        this.ShowDescription();

        if (!IsSelected)
        {
            this.overGlowObject.SetActive(true);
            this.UnitDisplay.OverHighlightOn();
        }
    }

    public void OverHighlightOff()
    {
        this.HideDescription();

        if (!IsSelected)
        {
            this.overGlowObject.SetActive(false);
            this.UnitDisplay.OverHighlightOff();
        }
    }

    public void UpdateZIndex()
    {
        Vector3 position = transform.localPosition;
        float z = (float)(position.x * 0.01) - 10;

        if (IsZoomed)
        {
            z = -50;
        }

        this.transform.localPosition = new Vector3(position.x, position.y, z);
    }

    public void Shake()
    {
        if (this.UnitDisplay)
        {
            this.UnitDisplay.Shake();
        }
    }

    public void ShowAbilities()
    {
        if (this.UnitDisplay)
        {
            this.UnitDisplay.ShowAbilities();
        }
    }

    public void HideAbilities()
    {
        if (this.UnitDisplay)
        {
            this.UnitDisplay.HideAbilities();
        }
    }

    private void ShowDescription()
    {
        this.descritionContainer.SetActive(true);
    }

    private void HideDescription()
    {
        this.descritionContainer.SetActive(false);
    }

    private void OnLeftMouseClicked()
    {
        Unibus.Dispatch(CARD_SELECTED_TO_PLAY, this);
    }

    private void OnRightMouseClicked()
    {
        Unibus.Dispatch(CARD_PLAY_AS_MANA, this);
    }

    private IEnumerator LoadSprite()
    {
        WWW www = new WWW(Config.LOBBY_SERVER_URL + cardData.image);
        yield return www;

        Sprite sprite = Sprite.Create(www.texture, new Rect(0, 0, www.texture.width, www.texture.height), new Vector2(0.5F, 0.5F));

        artwork.GetComponent<SpriteRenderer>().sprite = sprite;
    }

    private void CheckRightMouseDown()
    {
        if (Input.GetMouseButtonDown(1))
        {
            Vector3 mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
            Vector2 mousePos2D = new Vector2(mousePos.x, mousePos.y);

            RaycastHit2D hit = Physics2D.Raycast(mousePos2D, Vector2.zero);
            if (hit && hit.collider.gameObject == this.gameObject)
            {
                OnRightMouseClicked();
            }
        }
    }

    private void OnMouseDown()
    {
        OnLeftMouseClicked();
    }

    private void OnMouseEnter()
    {
        this.ShowDescription();
        Unibus.Dispatch(CARD_MOUSE_ENTER, this);
    }

    private void OnMouseExit()
    {
        this.HideDescription();
        Unibus.Dispatch(CARD_MOUSE_EXIT, this);
    }

    private void FillDescription()
    {
        string descriptionText = "";
        if (this.cardData.abilities.range != null)
        {
            if (this.cardData.abilities.range.minRange > 1)
            {

                descriptionText += "Range " + this.cardData.abilities.range.minRange + "-" + this.cardData.abilities.range.range + "\n";
            }
            else
            {
                descriptionText += "Range " + this.cardData.abilities.range.range + "\n";
            }
        }
        if (this.cardData.abilities.firstStrike)
        {
            descriptionText += "First strike\n";
        }
        if (this.cardData.abilities.armored != null)
        {
            descriptionText += "Armored " + this.cardData.abilities.armored.armor + "\n";
        }
        if (this.cardData.abilities.vampiric)
        {
            descriptionText += "Vampiric\n";
        }
        if (this.cardData.abilities.noEnemyRetaliation)
        {
            descriptionText += "No enemy retaliation\n";
        }
        if (this.cardData.abilities.piercing)
        {
            descriptionText += "Cleave\n";
        }
        if (this.cardData.abilities.speed != null)
        {
            descriptionText += "Speed " + this.cardData.abilities.speed.speed + "\n";
        }
        if (this.cardData.abilities.flanking != null)
        {
            descriptionText += "Flanking " + this.cardData.abilities.flanking.damage + "\n";
        }
        if (this.cardData.abilities.push != null)
        {
            descriptionText += "Push " + this.cardData.abilities.push.range + "\n";
        }
        if (this.cardData.abilities.ricochet)
        {
            descriptionText += "Ricochet\n";
        }
        if (this.cardData.abilities.healing != null)
        {
            descriptionText += "Healing " + this.cardData.abilities.healing.heal + " (range " + this.cardData.abilities.healing.range + ")\n";
        }
        if (this.cardData.abilities.block != null)
        {
            descriptionText += "Block " + this.cardData.abilities.block.blockingDamage + " (range " + this.cardData.abilities.block.range + ")\n";
        }
        if (this.cardData.abilities.mana != null)
        {
            descriptionText += "Mana " + this.cardData.abilities.mana.mana + "\n";
        }
        if (this.cardData.abilities.regeneration != null)
        {
            descriptionText += "Regeneration " + this.cardData.abilities.regeneration.regeneration + "\n";
        }
        if (this.cardData.abilities.bash)
        {
            descriptionText += "Bash\n";
        }
        if (this.cardData.abilities.evasion != null)
        {
            descriptionText += "Evasion\n";
        }
        if (this.cardData.abilities.poison != null)
        {
            descriptionText += "Poison " + this.cardData.abilities.poison.poisonDamage + "\n";
        }
        if (this.cardData.abilities.damageCurse != null)
        {
            descriptionText += "Damage curse " + this.cardData.abilities.damageCurse.damageReduction + "\n";
        }
        if (this.cardData.abilities.aoe != null)
        {
            var withDiagonalText = "";
            if (this.cardData.abilities.aoe.diagonal)
            {
                withDiagonalText = " (with diagonal)";
            }
            descriptionText += "AOE " + this.cardData.abilities.aoe.range + withDiagonalText + "\n";
        }
        if (this.cardData.abilities.hpAura != null)
        {
            descriptionText += "HP Aura " + this.cardData.abilities.hpAura.hpBuff + " (range " + this.cardData.abilities.hpAura.range + ")" + "\n";
        }
        if (this.cardData.abilities.aiming != null)
        {
            descriptionText += "Aiming " + this.cardData.abilities.aiming.numberOfAimingForAttack + "\n";
        }

        this.descriptionText.text = descriptionText;
    }

    private void FillNegativeEffects()
    {
        string negativeEffectsText = "";

        if (this.cardData.abilities.range != null && this.cardData.abilities.range.blockedInBeginningOfTurn)
        {
            negativeEffectsText += "Can't shoot\n";
        }

        if (this.cardData.negativeEffects.damageCursed != null)
        {
            negativeEffectsText += "- " + this.cardData.negativeEffects.damageCursed.damageReduction + " damage (damage curse) \n";
        }

        if (this.cardData.negativeEffects.poisoned != null)
        {
            negativeEffectsText += "Poisoned - " + this.cardData.negativeEffects.poisoned.damage + "\n";
        }

        this.negativeEffectsText.text = negativeEffectsText;
    }

    private void FillPositiveEffects()
    {
        string positiveEffectsText = "";

        if (this.cardData.abilities.aiming != null && this.cardData.abilities.aiming.numberOfAiming > 0)
        {
            positiveEffectsText += "Aimed " + this.cardData.abilities.aiming.numberOfAiming + " / " + this.cardData.abilities.aiming.numberOfAimingForAttack + "\n";
        }

        if (this.cardData.positiveEffects.hpAuraBuff != null)
        {
            positiveEffectsText += "+ " + this.cardData.positiveEffects.hpAuraBuff.hpBuff + " hp (hp aura buff) \n";
        }

        this.positiveEffectsText.text = positiveEffectsText;
    }
}
