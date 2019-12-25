using System;
using System.Collections;
using System.Collections.Generic;
using System.Timers;
using TMPro;
using UnibusEvent;
using UnityEngine;
using UnityEngine.UI;


public class Step
{
    public enum Arrow
    {
        left, bottom, right, bottomLeft
    }

    public string text;
    public bool autoNext;
    public string stepEvent;
    public Type stepEventType;
    public Func<CardDisplay, bool> eventCondition;
    public int[] dialogPosition;
    public Arrow? arrow;
    public int? waitBeforeFinish;
}

public class Tutorial : MonoBehaviour
{
    private int currentStepIndex = 0;
    private GameObject dialog;
    private GameObject arrowLeft;
    private GameObject arrowRight;
    private GameObject arrowBottom;
    private GameObject arrowBottomLeft;

    // TODO: wait, image

    private Step[] tutorialSteps = new Step[] {
        new Step() {
            text = "To win in game, you should kill two enemy heroes, and save at least one of you hero.",
            autoNext = true
        },
        new Step() {
            text = "This is your heroes.",
            autoNext = true,
            dialogPosition = new [] { -300, 0 },
            arrow = Step.Arrow.right
        },
        new Step() {
            text = "And this is enemy heroes.",
            autoNext = true,
            dialogPosition = new [] { 300, 150 },
            arrow = Step.Arrow.left
        },
        new Step() {
            text = "To move hero, click on it, and then click on empty tile.",
            autoNext = false,
            stepEvent = CardManager.CARD_MOVED,
            eventCondition = (CardDisplay c) => { return c.IsAlly; },
            waitBeforeFinish = 2
        },
        new Step() {
            text = "This is your hand cards.\nYou can play cards from hand to summon creatures on the battle field.\n\nEvery card have mana cost value, that located at the top left of the card.",
            autoNext = true,
            dialogPosition = new [] { 0, 130 },
            arrow = Step.Arrow.bottom
        },
        new Step() {
            text = "This is your mana.\nAt the end of every turn you get 3 mana if you have empty mana slots.",
            autoNext = true,
            dialogPosition = new [] { -650, 220 },
            arrow = Step.Arrow.bottomLeft
        },
        new Step() {
            text = "Lets summon a creature with 3 mana cost.\nTo do this click on card at hand, and then click on empty tile at battle field.\nYou can summon creatures only with nearby of the your heroes.",
            stepEvent = CardManager.CARD_PLAYED,
            eventCondition = (CardDisplay c) => { return c.IsAlly; },
            waitBeforeFinish = 2
        },
        new Step() {
            text = "When creature summoned at this turn, it can't do any action.",
            autoNext = true
        },
        new Step() {
            text = "Move all your heroes, and click 'End of turn' button.",
            stepEvent = CardManager.TURN_ENDED,
            eventCondition = (CardDisplay c) => { return !GameState.isMainPlayerTurn; },
            waitBeforeFinish = 6
        },
        new Step() {
            text = "Try to attack any enemy unit.\n\nTo attack enemy your unit should stand nearby of it. You can't attack diagonally.",
            stepEvent = CardManager.CARD_ATTACKED,
            eventCondition = (CardDisplay c) => { return c.IsAlly; },
            waitBeforeFinish = 2
        },
        new Step() {
            text = "If any unit is attacked, it immediately strikes back every time.",
            autoNext = true
        },
        new Step() {
            text = "All units have one or more abilities. To read ability description move mouse on ability name.",
            autoNext = true
        },
        new Step() {
            text = "Lets use heal ability of your hero.\n\nBy clicking on it, you will see the healing button under the hero.\nClick on heal and click on any wounded unit nearby of the hero.",
            stepEvent = CardManager.CARD_HEALED,
            eventCondition = (CardDisplay c) => { return c.IsAlly; },
            waitBeforeFinish = 2
        },
        new Step() {
            text = "To have more then 3 mana you need to obtain more mana slots.\nTo get mana slot, move mouse on any card in hand and click on 'Convert to mana slot' button.\nConverted cards will be destroyed.",
            autoNext = true
        },
        new Step() {
            text = "Collect 6 mana and play card with 6 mana cost.",
            stepEvent = CardManager.CARD_PLAYED,
            eventCondition = (CardDisplay c) => { return c.IsAlly && c.cardData.manaCost >= 6; },
            waitBeforeFinish = 2
        },
        new Step() {
            text = "Orc ranger have range ability.\nAfter clicking on ranger you will see yellow tiles. It showes tiles you can shoot.",
            autoNext = true
        },
        new Step() {
            text = "End turn, and then try to shoot any enemy by Orc ranger.",
            stepEvent = CardManager.CARD_ATTACKED,
            eventCondition = (CardDisplay c) => { return c.IsAlly; },
            waitBeforeFinish = 2
        },
        new Step() {
            text = "You have finished the tutorial!\nKill all enemy heroes to win in the game."
        },
    };

    public void Awake()
    {
        this.dialog = this.transform.Find("Dialog").gameObject;
        this.arrowLeft = this.dialog.transform.Find("ArrowLeft").gameObject;
        this.arrowRight = this.dialog.transform.Find("ArrowRight").gameObject;
        this.arrowBottom = this.dialog.transform.Find("ArrowBottom").gameObject;
        this.arrowBottomLeft = this.dialog.transform.Find("ArrowBottomLeft").gameObject;
    }

    public void Start()
    {
        this.dialog.transform.Find("OKButton").GetComponent<Button>().onClick.AddListener(this.DialogClickHandler);

        if (GameState.tutorial)
        {
            this.Init();
        }
    }

    public void Init()
    {
        this.ShowDialog(this.GetCurrentStep());
    }

    private void NextStep()
    {
        if (this.currentStepIndex <= this.tutorialSteps.Length)
        {
            var currentStep = this.GetCurrentStep();
            if (currentStep.stepEvent != null)
            {
                Unibus.Unsubscribe<CardDisplay>(this.GetCurrentStep().stepEvent, this.OnEventHandled);
            }

            if (this.GetCurrentStep().waitBeforeFinish != null)
            {
                StartCoroutine(Countdown((int)currentStep.waitBeforeFinish));
            }
            else
            {
                this.currentStepIndex++;
                this.ShowDialog(this.GetCurrentStep());
            }
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

        if (step.dialogPosition != null)
        {
            this.dialog.transform.localPosition = new Vector3(step.dialogPosition[0], step.dialogPosition[1], 0);
        } else
        {
            this.dialog.transform.localPosition = new Vector3(0, 70, 0);
        }

        this.arrowLeft.SetActive(false);
        this.arrowBottom.SetActive(false);
        this.arrowRight.SetActive(false);
        this.arrowBottomLeft.SetActive(false);

        if (step.arrow != null)
        {
            if (step.arrow == Step.Arrow.left)
            {
                this.arrowLeft.SetActive(true);
            }
            if (step.arrow == Step.Arrow.bottom)
            {
                this.arrowBottom.SetActive(true);
            }
            if (step.arrow == Step.Arrow.right)
            {
                this.arrowRight.SetActive(true);
            }
            if (step.arrow == Step.Arrow.bottomLeft)
            {
                this.arrowBottomLeft.SetActive(true);
            }
        }
    }

    private void DialogClickHandler()
    {
        this.dialog.SetActive(false);

        if (this.GetCurrentStep().autoNext)
        {
            this.NextStep();
        }
    }

    private void OnEventHandled(CardDisplay cardDisplay)
    {
        bool isNextStep = true;
        var step = this.GetCurrentStep();
        if (step.eventCondition != null)
        {
            isNextStep = step.eventCondition(cardDisplay);
        }

        if (isNextStep)
        {
            this.NextStep();
        }
    }

    private IEnumerator Countdown(int time)
    {
        while (true)
        {
            yield return new WaitForSeconds(time);
            this.currentStepIndex++;
            this.ShowDialog(this.GetCurrentStep());
            yield break;
        }
    }

    private Step GetCurrentStep()
    {
        return this.tutorialSteps[this.currentStepIndex];
    }
}
