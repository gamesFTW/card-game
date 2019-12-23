using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Reflection;
using TMPro;
using UnibusEvent;
using UnityEngine;
using UnityEngine.UI;

public class Step
{
    public string text;
    public bool autoNext;
    public string stepEvent;
    public Type stepEventType;
}

public class Tutorial : MonoBehaviour
{
    private int currentStepIndex = 0;
    private GameObject dialog;

    private Step[] tutorialSteps = new Step[] {
        new Step() {text = "To win in game, you should kill two enemy heroes, and save at least one of you hero.", autoNext = true},
        new Step() {text = "This is your heroes.", autoNext = true},
        new Step() {text = "And this is enemy heroes.", autoNext = true},
        new Step() {text = "To move hero, click on it, and then click on empty tile.", autoNext = false, stepEvent = CardManager.CARD_MOVED},
        new Step() {text = "This is your hand cards.\nYou can play cards from hand to summon creatures on the battle field.\n\nEvery card have mana cost value, that located at the top left of the card.", autoNext = true},
        new Step() {text = "This is your mana.\nAt the end of every turn you get 3 mana if you have empty mana slots.", autoNext = true},
        new Step() {text = "To summon creature click on card at hand with 3 mana cost, and then click on empty tile at battle field.\nYou can summon creatures only with nearby of the your heroes.", stepEvent = CardManager.CARD_PLAYED},
        new Step() {text = "When creature summoned at this turn, it can't do any action.", autoNext = true},
        new Step() {text = "Move all your heroes, and click 'End of turn' button.", stepEvent = CardManager.TURN_ENDED},
        new Step() {text = "To attack enemy your unit should stand nearby of it. You can't attack diagonally.\nTry to attack any enemy unit.", stepEvent = CardManager.CARD_ATTACKED},
        new Step() {text = "To have more then 3 mana you need to obtain more mana slots.\nTo get mana slot, move mouse on any card in hand and click on 'Convert to mana slot' button.\nConverted cards destroed.", autoNext = true},
        new Step() {text = "Collect 6 mana and play card with 6 mana cost.", stepEvent = CardManager.CARD_PLAYED},
    };

    public void Awake()
    {
        this.dialog = this.transform.Find("Dialog").gameObject;
    }

    public void Start()
    {
        this.dialog.transform.Find("OKButton").GetComponent<Button>().onClick.AddListener(this.DialogClickHandler);

        this.Init();
    }

    public void Init()
    {
        this.NextStep();
    }

    private void NextStep()
    {
        if (this.currentStepIndex <= this.tutorialSteps.Length)
        {
            this.ShowDialog(this.GetCurrentStep());
        }
    }

    private void ShowDialog(Step step)
    {
        this.dialog.SetActive(true);
        this.dialog.transform.Find("Text").GetComponent<TextMeshProUGUI>().text = step.text;
        this.dialog.transform.Find("StepCounter").GetComponent<TextMeshProUGUI>().text
            = $"{this.currentStepIndex + 1} / {this.tutorialSteps.Length}";

        if (step.stepEvent != null)
        {
            Unibus.Subscribe<CardDisplay>(step.stepEvent, this.OnEventHandled);
        }
    }

    private void DialogClickHandler()
    {
        this.dialog.SetActive(false);

        if (this.GetCurrentStep().autoNext)
        {
            this.currentStepIndex++;
            this.NextStep();
        }
    }

    private void OnEventHandled(CardDisplay _)
    {
        this.currentStepIndex++;
        this.NextStep();
    }

    private Step GetCurrentStep()
    {
        return this.tutorialSteps[this.currentStepIndex];
    }
}
