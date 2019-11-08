using UnityEngine;
using TMPro;

public class CardAbilitiesDescription : MonoBehaviour
{
    private CardDisplay cardDisplay;

    private GameObject descritionContainer;

    private TextMeshPro descriptionText;
    private TextMeshPro negativeEffectsText;
    private TextMeshPro positiveEffectsText;

    void Awake()
    {
        this.cardDisplay = this.GetComponent<CardDisplay>();
    }

    void Start()
    {
        this.descritionContainer = this.transform.Find("Front").Find("DescritionContainer").gameObject;

        this.descriptionText = descritionContainer.transform.Find("Description").GetComponent<TextMeshPro>();
        this.negativeEffectsText = descritionContainer.transform.Find("NegativeEffects").GetComponent<TextMeshPro>();
        this.positiveEffectsText = descritionContainer.transform.Find("PositiveEffects").GetComponent<TextMeshPro>();

        this.FillDescription();
        this.FillNegativeEffects();
        this.FillPositiveEffects();
    }

    public void ShowDescription()
    {
        this.descritionContainer.SetActive(true);
    }

    public void HideDescription()
    {
        this.descritionContainer.SetActive(false);
    }

    public void FillDescription()
    {
        string descriptionText = "";
        if (this.cardDisplay.cardData.abilities.range != null)
        {
            if (this.cardDisplay.cardData.abilities.range.minRange > 1)
            {

                descriptionText += "Range " + this.cardDisplay.cardData.abilities.range.minRange + "-" + this.cardDisplay.cardData.abilities.range.range + "\n";
            }
            else
            {
                descriptionText += "Range " + this.cardDisplay.cardData.abilities.range.range + "\n";
            }
        }
        if (this.cardDisplay.cardData.abilities.firstStrike)
        {
            descriptionText += "First strike\n";
        }
        if (this.cardDisplay.cardData.abilities.armored != null)
        {
            descriptionText += "Armored " + this.cardDisplay.cardData.abilities.armored.armor + "\n";
        }
        if (this.cardDisplay.cardData.abilities.vampiric)
        {
            descriptionText += "Vampiric\n";
        }
        if (this.cardDisplay.cardData.abilities.noEnemyRetaliation)
        {
            descriptionText += "No enemy retaliation\n";
        }
        if (this.cardDisplay.cardData.abilities.piercing)
        {
            descriptionText += "Cleave\n";
        }
        if (this.cardDisplay.cardData.abilities.speed != null)
        {
            descriptionText += "Speed " + this.cardDisplay.cardData.abilities.speed.speed + "\n";
        }
        if (this.cardDisplay.cardData.abilities.flanking != null)
        {
            descriptionText += "Flanking " + this.cardDisplay.cardData.abilities.flanking.damage + "\n";
        }
        if (this.cardDisplay.cardData.abilities.push != null)
        {
            descriptionText += "Push " + this.cardDisplay.cardData.abilities.push.range + "\n";
        }
        if (this.cardDisplay.cardData.abilities.ricochet)
        {
            descriptionText += "Ricochet\n";
        }
        if (this.cardDisplay.cardData.abilities.healing != null)
        {
            descriptionText += "Healing " + this.cardDisplay.cardData.abilities.healing.heal + " (range " + this.cardDisplay.cardData.abilities.healing.range + ")\n";
        }
        if (this.cardDisplay.cardData.abilities.block != null)
        {
            descriptionText += "Block " + this.cardDisplay.cardData.abilities.block.blockingDamage + " (range " + this.cardDisplay.cardData.abilities.block.range + ")\n";
        }
        if (this.cardDisplay.cardData.abilities.mana != null)
        {
            descriptionText += "Mana " + this.cardDisplay.cardData.abilities.mana.mana + "\n";
        }
        if (this.cardDisplay.cardData.abilities.regeneration != null)
        {
            descriptionText += "Regeneration " + this.cardDisplay.cardData.abilities.regeneration.regeneration + "\n";
        }
        if (this.cardDisplay.cardData.abilities.bash)
        {
            descriptionText += "Bash\n";
        }
        if (this.cardDisplay.cardData.abilities.evasion != null)
        {
            descriptionText += "Evasion\n";
        }
        if (this.cardDisplay.cardData.abilities.poison != null)
        {
            descriptionText += "Poison " + this.cardDisplay.cardData.abilities.poison.poisonDamage + "\n";
        }
        if (this.cardDisplay.cardData.abilities.damageCurse != null)
        {
            descriptionText += "Damage curse " + this.cardDisplay.cardData.abilities.damageCurse.damageReduction + "\n";
        }
        if (this.cardDisplay.cardData.abilities.aoe != null)
        {
            var withDiagonalText = "";
            if (this.cardDisplay.cardData.abilities.aoe.diagonal)
            {
                withDiagonalText = " (with diagonal)";
            }
            descriptionText += "AOE " + this.cardDisplay.cardData.abilities.aoe.range + withDiagonalText + "\n";
        }
        if (this.cardDisplay.cardData.abilities.hpAura != null)
        {
            descriptionText += "HP Aura " + this.cardDisplay.cardData.abilities.hpAura.hpBuff + " (range " + this.cardDisplay.cardData.abilities.hpAura.range + ")" + "\n";
        }
        if (this.cardDisplay.cardData.abilities.aiming != null)
        {
            descriptionText += "Aiming " + this.cardDisplay.cardData.abilities.aiming.numberOfAimingForAttack + "\n";
        }

        this.descriptionText.text = descriptionText;
    }

    public void FillNegativeEffects()
    {
        string negativeEffectsText = "";

        if (this.cardDisplay.cardData.abilities.range != null && this.cardDisplay.cardData.abilities.range.blockedInBeginningOfTurn)
        {
            negativeEffectsText += "Can't shoot\n";
        }

        if (this.cardDisplay.cardData.negativeEffects.damageCursed != null)
        {
            negativeEffectsText += "- " + this.cardDisplay.cardData.negativeEffects.damageCursed.damageReduction + " damage (damage curse) \n";
        }

        if (this.cardDisplay.cardData.negativeEffects.poisoned != null)
        {
            negativeEffectsText += "Poisoned - " + this.cardDisplay.cardData.negativeEffects.poisoned.damage + "\n";
        }

        this.negativeEffectsText.text = negativeEffectsText;
    }

    public void FillPositiveEffects()
    {
        string positiveEffectsText = "";

        if (this.cardDisplay.cardData.abilities.aiming != null && this.cardDisplay.cardData.abilities.aiming.numberOfAiming > 0)
        {
            positiveEffectsText += "Aimed " + this.cardDisplay.cardData.abilities.aiming.numberOfAiming + " / " + this.cardDisplay.cardData.abilities.aiming.numberOfAimingForAttack + "\n";
        }

        if (this.cardDisplay.cardData.positiveEffects.hpAuraBuff != null)
        {
            positiveEffectsText += "+ " + this.cardDisplay.cardData.positiveEffects.hpAuraBuff.hpBuff + " hp (hp aura buff) \n";
        }

        this.positiveEffectsText.text = positiveEffectsText;
    }
}
