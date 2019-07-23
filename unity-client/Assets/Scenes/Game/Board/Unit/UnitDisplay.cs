using UnityEngine;
using System.Collections;
using DG.Tweening;
using System.Collections.Generic;
using UnibusEvent;

public class UnitDisplay : MonoBehaviour
{
    public static readonly string ABILITY_ACTIVATED = "ABILITY_ACTIVATED";

    public Sprite sprite;
    public CardDisplay CardDisplay;

    private Tween shakeTween;

    public CardData CardData
    {
        get { return cardData; }
        set {
            cardData = value;
            StartCoroutine(LoadSprite());
        }
    }

    private CardData cardData;

    private GameObject blueGlow;
    private GameObject redGlow;
    private GameObject blueBack;
    private GameObject redBack;
    private GameObject selectedGlowObject;
    private GameObject overGlowObject;
    private GameObject abilitiesStatus;

    private GameObject abilities;

    private bool IsSelected = false;

    // Start is called before the first frame update
    private void Start()
    {
        this.blueGlow = this.transform.Find("BlueGlow").gameObject;
        this.redGlow = this.transform.Find("RedGlow").gameObject;
        this.blueBack = this.transform.Find("BlueBack").gameObject;
        this.redBack = this.transform.Find("RedBack").gameObject;
        this.selectedGlowObject = this.transform.Find("SelectedGlow").gameObject;
        this.overGlowObject = this.transform.Find("OverGlow").gameObject;

        this.abilitiesStatus = this.transform.Find("AbilitiesStatus").gameObject;

        this.EnableTeamColor();
        this.EnableHeroColor();
        this.CheckForActivatedAbilities();

        this.RedrawAbilisiesStatus();
    }

    // Update is called once per frame
    private void Update()
    {

    }

    public void SelectedHighlightOn()
    {
        selectedGlowObject.SetActive(true);
        IsSelected = true;
        this.DisableTeamColor();
        this.overGlowObject.SetActive(false);
    }

    public void SelectedHighlightOff()
    {
        selectedGlowObject.SetActive(false);
        IsSelected = false;
        this.EnableTeamColor();
    }

    public void OverHighlightOn()
    {
        if (!IsSelected)
        {
            this.overGlowObject.SetActive(true);
            this.DisableTeamColor();
        }
    }

    public void OverHighlightOff()
    {
        if (!IsSelected)
        {
            this.overGlowObject.SetActive(false);
            this.EnableTeamColor();
        }
    }

    public void EnableTeamColor()
    {
        if (this.CardDisplay.IsAlly)
        {
            blueGlow.SetActive(true);
        }
        else
        {
            redGlow.SetActive(true);
        }
    }

    public void DisableTeamColor()
    {
        blueGlow.SetActive(false);
        redGlow.SetActive(false);
    }

    public void BlinkOn()
    {
        BlinkedSpriteRenderer spriteRenderer;

        if (IsSelected)
        {
            spriteRenderer = this.selectedGlowObject.GetComponent<BlinkedSpriteRenderer>();

        }
        else if (this.CardDisplay.IsAlly)
        {
            spriteRenderer = this.blueGlow.GetComponent<BlinkedSpriteRenderer>();
        } else
        {
            spriteRenderer = this.redGlow.GetComponent<BlinkedSpriteRenderer>();
        }

        spriteRenderer.BlinkOn();
    }

    public void BlinkOff()
    {
        BlinkedSpriteRenderer spriteRenderer;

        spriteRenderer = this.selectedGlowObject.GetComponent<BlinkedSpriteRenderer>();
        spriteRenderer.BlinkOff();
        spriteRenderer = this.blueGlow.GetComponent<BlinkedSpriteRenderer>();
        spriteRenderer.BlinkOff();
        spriteRenderer = this.redGlow.GetComponent<BlinkedSpriteRenderer>();
        spriteRenderer.BlinkOff();
    }

    public void Shake()
    {
        bool isNeedShake = true;

        if (this.shakeTween != null && this.shakeTween.IsPlaying())
        {
            isNeedShake = false;
        }

        if (isNeedShake)
        {
            shakeTween = this.transform.DOShakePosition(0.5f, new Vector3(0.2f, 0, 0), 10, 90);
        }
    }

    public void ShowAbilities()
    {
        if (this.abilities != null)
        {
            this.abilities.SetActive(true);
        }
    }

    public void HideAbilities()
    {
        if (this.abilities != null)
        {
            this.abilities.SetActive(false);
        }
    }

    public void RedrawAbilisiesStatus()
    {
        foreach (Transform child in this.abilitiesStatus.transform)
        {
            GameObject.Destroy(child.gameObject);
        }
        if (this.cardData.abilities.block != null)
        {
            if (this.cardData.abilities.block.usedInThisTurn == false)
            {
                this.RedrawAbilityStatus("SpellBook01_48");
            }
        }
    }

    private void RedrawAbilityStatus(string path)
    {
        GameObject abilityStatusPrefab = Resources.Load<GameObject>("AbilityStatus");
        GameObject abilityStatus = Instantiate<GameObject>(abilityStatusPrefab, this.abilitiesStatus.transform);
        abilityStatus.transform.SetParent(this.abilitiesStatus.transform);

        Sprite abilitySprite = Resources.Load<Sprite>("Abilities/" + path);
        abilityStatus.transform.Find("Art").GetComponent<SpriteRenderer>().sprite = abilitySprite;
    }

    private void CheckForActivatedAbilities()
    {
        int numberOfactivatedAbilities = 0;
        List<Ability> abilities = new List<Ability>();

        if (this.cardData.abilities.healing != null)
        {
            numberOfactivatedAbilities++;
            abilities.Add(this.cardData.abilities.healing);
        }

        if (this.cardData.abilities.mana != null)
        {
            numberOfactivatedAbilities++;
            abilities.Add(this.cardData.abilities.mana);
        }

        if (numberOfactivatedAbilities == 1)
        {
            this.abilities = this.transform.Find("OneAbitily").gameObject;

            var ability1 = this.abilities.transform.Find("Ability1").gameObject.GetComponent<AbilityDisplay>();
            ability1.ability = abilities[0];
            ability1.OnActivateAbility = this.OnActivateAbility;
        }

        if (numberOfactivatedAbilities == 2)
        {
            this.abilities = this.transform.Find("TwoAbitily").gameObject;

            var ability1 = this.abilities.transform.Find("Ability1").gameObject.GetComponent<AbilityDisplay>();
            ability1.ability = abilities[0];
            ability1.OnActivateAbility = this.OnActivateAbility;

            var ability2 = this.abilities.transform.Find("Ability2").gameObject.GetComponent<AbilityDisplay>();
            ability2.ability = abilities[0];
            ability2.OnActivateAbility = this.OnActivateAbility;
        }
    }

    private void OnActivateAbility(Ability ability)
    {
        var abilityActivated = new AbilityActivated()
        {
            cardDisplay = this.CardDisplay,
            ability = ability
        };

        Unibus.Dispatch(ABILITY_ACTIVATED, abilityActivated);
    }

    private void EnableHeroColor()
    {
        if (this.cardData.hero)
        {
            if (this.CardDisplay.IsAlly)
            {
                blueBack.SetActive(true);
            }
            else
            {
                redBack.SetActive(true);
            }
        }
    }

    private IEnumerator LoadSprite()
    {
        WWW www = new WWW(Config.LOBBY_SERVER_URL + CardData.image);
        yield return www;

        Sprite sprite = Sprite.Create(www.texture, new Rect(0, 0, www.texture.width, www.texture.height), new Vector2(0.5F, 0.5F));

        SpriteRenderer spriteRenderer = GetComponent<SpriteRenderer>();
        spriteRenderer.sprite = sprite;
    }
}
