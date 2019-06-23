using UnibusEvent;
using UnityEngine;

public class PlayerActionsOnBoard : MonoBehaviour
{
    public static readonly string CARD_MOVE = "PlayerActionsOnBoard:CARD_MOVE";
    public static readonly string CARD_ATTACK = "PlayerActionsOnBoard:CARD_ATTACK";

    public NoSelectionsState noSelectionsState;
    public OwnUnitSelectedState ownUnitSelectedState;
    public SelectingPushTargetState selectingPushTargetState;
    public SelectingRicochetTargetState selectingRicochetTargetState;

    public ClickOutOfBoardEmmiter clickOutOfBoardEmmiter;

    public BoardCreator boardCreator;

    private void Awake()
    {
        boardCreator = this.transform.Find("Board").GetComponent<BoardCreator>();
    }

    // Start is called before the first frame update
    void Start()
    {
        clickOutOfBoardEmmiter = new ClickOutOfBoardEmmiter();

        noSelectionsState = new NoSelectionsState(this);
        ownUnitSelectedState = new OwnUnitSelectedState(this);
        selectingPushTargetState = new SelectingPushTargetState(this);
        selectingRicochetTargetState = new SelectingRicochetTargetState(this);

        noSelectionsState.Enable();
    }

    // Update is called once per frame
    void Update()
    {
        clickOutOfBoardEmmiter.CheckClickOutOfAnyCard();
    }

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

        AbilitiesParams abilitiesParams = new AbilitiesParams {};

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

        Unibus.Dispatch<AttackCardAction>(PlayerActionsOnBoard.CARD_ATTACK, attackCardAction);
    }

    public void EmmitCardMoveAction(UnitDisplay movingUnit, Point point)
    {
        Unibus.Dispatch<MoveCardAction>(PlayerActionsOnBoard.CARD_MOVE, new MoveCardAction
        {
            cardId = movingUnit.CardData.id,
            x = point.x.ToString(),
            y = point.y.ToString()
        });
    }
}
