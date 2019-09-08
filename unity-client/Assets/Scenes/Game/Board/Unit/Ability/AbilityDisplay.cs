using System;
using UnibusEvent;
using UnityEngine;

public class AbilityDisplay : MonoBehaviour
{
    public static readonly string ABILITY_MOUSE_ENTER = "ABILITY_MOUSE_ENTER";
    public static readonly string ABILITY_MOUSE_EXIT = "ABILITY_MOUSE_EXIT";

    public Action<Ability> OnActivateAbility;

    private GameObject selectedGlow;
    private GameObject abilityImage;
    private Ability _ability;

    public Ability ability
    {
        set
        {
            this._ability = value;

            LoadSprite();
        }
    }

    // Start is called before the first frame update
    void Awake()
    {
        this.selectedGlow = this.transform.Find("SelectedGlow").gameObject;
    }

    // Update is called once per frame
    void Update()
    {

    }

    private void OnMouseDown()
    {
        this.OnActivateAbility(this._ability);
    }

    private void OnMouseEnter()
    {
        this.selectedGlow.SetActive(true);
        Unibus.Dispatch<AbilityDisplay>(ABILITY_MOUSE_ENTER, this);
    }

    private void OnMouseExit()
    {
        this.selectedGlow.SetActive(false);
        Unibus.Dispatch<AbilityDisplay>(ABILITY_MOUSE_EXIT, this);
    }

    private void LoadSprite()
    {
        Sprite sprite = null;
        if (this._ability is HealingAbility)
        {
            sprite = Resources.Load<Sprite>("Abilities/SpellBook01_06");
        }

        if (this._ability is ManaAbility)
        {
            sprite = Resources.Load<Sprite>("Abilities/SpellBook01_102");
        }

        if (this._ability is AimingAbility)
        {
            sprite = Resources.Load<Sprite>("Abilities/SpellBook01_64");
        }

        var abilityImage = this.transform.Find("AbilityMask").Find("AbilityImage").gameObject;
        SpriteRenderer spriteRenderer = abilityImage.GetComponent<SpriteRenderer>();
        spriteRenderer.sprite = sprite;
    }
}
