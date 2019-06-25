using UnibusEvent;
using UnityEngine;

public class PlayerActivities : MonoBehaviour
{
    public static readonly string CARD_MOVE = "PlayerActionsOnBoard:CARD_MOVE";
    public static readonly string CARD_ATTACK = "PlayerActionsOnBoard:CARD_ATTACK";

    public ClickOutOfBoardEmmiter clickOutOfBoardEmmiter;

    public BoardCreator boardCreator;
    private PlayerActionsOnBoardStates states;
    private ActionEmmiter actionEmmiter;

    private void Awake()
    {
        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();
    }

    void Start()
    {
        clickOutOfBoardEmmiter = new ClickOutOfBoardEmmiter();

        this.actionEmmiter = new ActionEmmiter()
        {
            boardCreator = this.boardCreator
        };

        this.states = new PlayerActionsOnBoardStates();

        this.states.noSelectionsState = new NoSelectionsState(this.states, this.boardCreator);

        this.states.ownUnitSelectedState = new OwnUnitSelectedState(this.states, this.boardCreator)
        {
            actionEmmiter = this.actionEmmiter,
            OnEnabled = this.OnStateEnabled
        };

        this.states.selectingPushTargetState = new SelectingPushTargetState(this.states, this.boardCreator)
        {
            actionEmmiter = this.actionEmmiter,
            OnEnabled = this.OnStateEnabled
        };

        this.states.selectingRicochetTargetState = new SelectingRicochetTargetState(this.states, this.boardCreator)
        {
            actionEmmiter = this.actionEmmiter,
            OnEnabled = this.OnStateEnabled
        };

        this.states.selectingTileForCardPlayingState = new SelectingTileForCardPlayingState(this.states, this.boardCreator);

        this.states.noSelectionsState.Enable();
    }

    void Update()
    {
        clickOutOfBoardEmmiter.CheckClickOutOfAnyCard();
        this.states.selectingTileForCardPlayingState.CheckClickOutOfAnyCard();
    }

    private void OnStateEnabled()
    {
        this.clickOutOfBoardEmmiter.Reset();
    }
}

public class PlayerActionsOnBoardStates
{
    public NoSelectionsState noSelectionsState;
    public OwnUnitSelectedState ownUnitSelectedState;
    public SelectingPushTargetState selectingPushTargetState;
    public SelectingRicochetTargetState selectingRicochetTargetState;
    public SelectingTileForCardPlayingState selectingTileForCardPlayingState;
}

public class ActionEmmiter
{
    public BoardCreator boardCreator;

    public void EmmitCardAttackAction(UnitDisplay attackerUnit, UnitDisplay attackedUnit, Point pushPoint = null, UnitDisplay ricochetTarget = null)
    {
        bool isCardsAdjacent = this.boardCreator.CheckCardsAdjacency(attackerUnit.gameObject, attackedUnit.gameObject);
        bool isRangeAttack = !isCardsAdjacent;

        AttackCardAction attackCardAction = new AttackCardAction
        {
            attackerCardId = attackerUnit.CardData.id,
            attackedCardId = attackedUnit.CardData.id,
            isRangeAttack = isRangeAttack
        };

        AbilitiesParams abilitiesParams = new AbilitiesParams { };

        if (pushPoint != null)
        {
            abilitiesParams.pushAt = pushPoint;

            attackCardAction.abilitiesParams = abilitiesParams;
        }

        if (ricochetTarget != null)
        {
            abilitiesParams.ricochetTargetCardId = ricochetTarget.CardData.id;
        }

        attackCardAction.abilitiesParams = abilitiesParams;

        Unibus.Dispatch<AttackCardAction>(PlayerActivities.CARD_ATTACK, attackCardAction);
    }

    public void EmmitCardMoveAction(UnitDisplay movingUnit, Point point)
    {
        Unibus.Dispatch<MoveCardAction>(PlayerActivities.CARD_MOVE, new MoveCardAction
        {
            cardId = movingUnit.CardData.id,
            x = point.x.ToString(),
            y = point.y.ToString()
        });
    }
}
