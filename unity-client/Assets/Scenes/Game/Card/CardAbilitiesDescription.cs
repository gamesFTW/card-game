using UnityEngine;
using TMPro;
using System.Reflection;

public class CardAbilitiesDescription : MonoBehaviour
{
    private CardDisplay cardDisplay;

    private GameObject abilitiesDescription;
    private GameObject abilitiesDescriptionList;
    private GameObject abilityDescription;

    private int countOfText = 0;

    void Awake()
    {
        this.cardDisplay = this.GetComponent<CardDisplay>();
    }

    void Start()
    {
        this.abilitiesDescription = this.transform.Find("Front").Find("AbilitiesDescription").gameObject;
        this.abilitiesDescriptionList = this.abilitiesDescription.transform.Find("AbilitiesDescriptionList").gameObject;
        this.abilityDescription = this.abilitiesDescription.transform.Find("AbililtyDescription").gameObject;

        this.FillDescription();
    }

    public void FillDescription()
    {
        this.countOfText = 0;
        foreach (Transform child in this.abilitiesDescriptionList.transform)
        {
            GameObject.Destroy(child.gameObject);
        }

        this.FillAbilitiesDescription();
        this.FillNegativeEffects();
        this.FillPositiveEffects();
    }

    public void ShowDescription()
    {
        this.abilitiesDescription.SetActive(true);
    }

    public void HideDescription()
    {
        this.abilitiesDescription.SetActive(false);
    }

    public void ShowAbilityDescription(string text)
    {
        this.abilityDescription.SetActive(true);
        this.abilityDescription.transform.Find("Text").GetComponent<TextMeshPro>().text = text;
    }

    public void HideAbilityDescription()
    {
        this.abilityDescription.SetActive(false);
    }

    private void CreateText(string abilityName, string abilityDescription, UnityEngine.Color color)
    {
        GameObject cardStatusTextPrefab = Resources.Load<GameObject>("CardStatusText");
        GameObject cardStatusTextInstance = Instantiate<GameObject>(cardStatusTextPrefab, this.abilitiesDescriptionList.transform);
        var cardStatusText = cardStatusTextInstance.GetComponent<CardStatusText>();
        cardStatusText.abilityDescription = abilityDescription;
        cardStatusText.OnCustomMouseEnter = this.ShowAbilityDescription;
        cardStatusText.OnCustomMouseExit = this.HideAbilityDescription;

        cardStatusTextInstance.transform.SetParent(this.abilitiesDescriptionList.transform);
        var textMeshPro = cardStatusTextInstance.GetComponent<TextMeshPro>();
        textMeshPro.text = abilityName;
        textMeshPro.color = color;

        cardStatusTextInstance.transform.localPosition += new Vector3(0, -this.countOfText * 46);

        this.countOfText++;
    }

    private void FillAbilitiesDescription()
    {
        string name = "";
        string description = "";

        if (this.cardDisplay.cardData.abilities.range != null)
        {
            var range = this.cardDisplay.cardData.abilities.range.range;
            var minRange = this.cardDisplay.cardData.abilities.range.minRange;

            string rangeText = "";
            if (this.cardDisplay.cardData.abilities.range.minRange > 1)
            {
                rangeText = $"{minRange}-{range}";
            }
            else
            {
                rangeText = $"{range}";
            }

            name = $"Range {rangeText}";
            description = $"Unit can attack enemy with distance attack on range {rangeText}.\nUnit with range attack don't relatite on mele attack.\nIf enemy unit end turn near unit with range attack, it cant shoot on this turn.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.firstStrike)
        {
            name = "First strike";
            description = "A unit with first strike deals combat damage before unit without first strike.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.armored != null)
        {
            var armor = this.cardDisplay.cardData.abilities.armored.armor;
            name = $"Damage reduction {armor}";
            description = $"Decreases incoming damage by {armor}.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.vampiric)
        {
            name = "Vampiric";
            description = "When unit attacks it heal as mutch health as inflict damage.\nVampiric don't work on retalation attcks.\nVampiric can overheal unit.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.noEnemyRetaliation)
        {
            name = "No enemy retaliation";
            description = "Enemies never retaliate after melee attacks by creatures with this ability.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.piercing)
        {
            name = "Pierce";
            description = "Attacks enemy unit hehind the target.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.speed != null)
        {
            name = $"Speed {this.cardDisplay.cardData.abilities.speed.speed}";
            description = $"Unit have speed {this.cardDisplay.cardData.abilities.speed.speed} instead of 3.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.flanking != null)
        {
            var flankingDamage = this.cardDisplay.cardData.abilities.flanking.damage;
            name = $"Flanking {flankingDamage}";
            description = $"Increase damage by {flankingDamage} when the an allied unit is on the opposite the target.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.push != null)
        {
            var pushRange = this.cardDisplay.cardData.abilities.push.range;
            name = $"Push {pushRange}";
            description = $"When unit attacks it can move enemy unit on {pushRange} squares.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.ricochet)
        {
            name = "Ricochet";
            description = "Additional unit to attack near the target.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.healing != null)
        {
            name = "Healing " + this.cardDisplay.cardData.abilities.healing.heal + " (range " + this.cardDisplay.cardData.abilities.healing.range + ")";
            description = "Healing " + this.cardDisplay.cardData.abilities.healing.heal + " (range " + this.cardDisplay.cardData.abilities.healing.range + ").";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.block != null)
        {
            var blockingDamage = this.cardDisplay.cardData.abilities.block.blockingDamage;
            var blockingRange = this.cardDisplay.cardData.abilities.block.range;
            name = $"Protect {blockingDamage} (range {blockingRange})";
            description = $"Once per turn decrease incoming damage by {blockingDamage} on an ally (on range {blockingRange}) unit or himself.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.mana != null)
        {
            var mana = this.cardDisplay.cardData.abilities.mana.mana;
            name = $"Mana {mana}";
            description = "Once per turn add {mana} mana.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.regeneration != null)
        {
            var regeneration = this.cardDisplay.cardData.abilities.regeneration.regeneration;
            name = $"Regeneration {regeneration}";
            description = $"At start of turn heal {regeneration} heals.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.bash)
        {
            name = "Bash";
            description = "Stuns attacking target on one turn.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.evasion != null)
        {
            name = "Evasion";
            description = "Once per turn igrone all damage of incoming attack.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.poison != null)
        {
            var poisonDamage = this.cardDisplay.cardData.abilities.poison.poisonDamage;
            name = $"Poison {poisonDamage}";
            description = $"Attack inflicts a poison effect, that inflicts {poisonDamage} damage on next attacker turn.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.damageCurse != null)
        {
            var damageReduction = this.cardDisplay.cardData.abilities.damageCurse.damageReduction;
            name = $"Damage curse {damageReduction}";
            description = $"Attack inflicts a curse effect, that decrease damage of target by {damageReduction}";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.aoe != null)
        {
            var range = this.cardDisplay.cardData.abilities.aoe.range;
            var withDiagonalText = "";
            if (this.cardDisplay.cardData.abilities.aoe.diagonal)
            {
                withDiagonalText = "(with diagonal)";
            }
            name = $"AOE {range} {withDiagonalText}";
            description = $"Attack all adjacent enemy units {withDiagonalText} near the target on range {range}.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.hpAura != null)
        {
            var hpBuff = this.cardDisplay.cardData.abilities.hpAura.hpBuff;
            var range = this.cardDisplay.cardData.abilities.hpAura.range;
            name = $"HP Aura {hpBuff} (range {range})";
            description = $"At end of your turn add buff that add {hpBuff} heals on all alled units on range {range}.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
        if (this.cardDisplay.cardData.abilities.aiming != null)
        {
            var numberOfAimingForAttack = this.cardDisplay.cardData.abilities.aiming.numberOfAimingForAttack;
            name = $"Aiming {numberOfAimingForAttack}";
            description = $"Unit have to prepare before any attack for {numberOfAimingForAttack} turns.";
            this.CreateText(name, description, UnityEngine.Color.white);
        }
    }

    private void FillNegativeEffects()
    {
        string name = "";
        string description = "";

        if (this.cardDisplay.cardData.abilities.range != null && this.cardDisplay.cardData.abilities.range.blockedInBeginningOfTurn)
        {
            name = "Can't shoot";
            description = "Unit can't shoot, because enemy unit end turn near it.";
            this.CreateText(name, description, UnityEngine.Color.red);
        }

        if (this.cardDisplay.cardData.negativeEffects.damageCursed != null)
        {
            var damageReduction = this.cardDisplay.cardData.negativeEffects.damageCursed.damageReduction;
            name = $"- {damageReduction} damage (damage curse)";
            description = $"Unit attacked by enemy with damage curse ability. Its damage reduced by {damageReduction}.";
            this.CreateText(name, description, UnityEngine.Color.red);
        }

        if (this.cardDisplay.cardData.negativeEffects.poisoned != null)
        {
            var poisonDamage = this.cardDisplay.cardData.negativeEffects.poisoned.damage;
            name = $"Poisoned - {poisonDamage}";
            description = $"Unit attacked by enemy with poison ability. At start of turn unit will take {poisonDamage} damage.";
            this.CreateText(name, description, UnityEngine.Color.red);
        }
    }

    private void FillPositiveEffects()
    {
        string name = "";
        string description = "";

        if (this.cardDisplay.cardData.abilities.aiming != null && this.cardDisplay.cardData.abilities.aiming.numberOfAiming > 0)
        {
            name = "Aimed " + this.cardDisplay.cardData.abilities.aiming.numberOfAiming + " / " + this.cardDisplay.cardData.abilities.aiming.numberOfAimingForAttack;
            description = "Aimed " + this.cardDisplay.cardData.abilities.aiming.numberOfAiming + " / " + this.cardDisplay.cardData.abilities.aiming.numberOfAimingForAttack;
            this.CreateText(name, description, UnityEngine.Color.green);
        }

        if (this.cardDisplay.cardData.positiveEffects.hpAuraBuff != null)
        {
            name = "+ " + this.cardDisplay.cardData.positiveEffects.hpAuraBuff.hpBuff + " hp (hp aura buff) \n";
            description = "Unit take effect of hp aura ability.";
            this.CreateText(name, description, UnityEngine.Color.green);
        }
    }
}
