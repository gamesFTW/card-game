using UnibusEvent;
using UnityEngine;

public class OwnUnitSelectedState : SelectingState
{
    private bool MouseOnTile = false;
    private UnitDisplay selectedUnit;

    public OwnUnitSelectedState(PlayerActionsOnBoardStates states, BoardCreator boardCreator) : base(states, boardCreator) { }

    public void Enable(UnitDisplay selectedUnit)
    {
        this.Enable();

        this.selectedUnit = selectedUnit;

        selectedUnit.CardDisplay.Select();
        selectedUnit.ShowAbilities();

        this.boardCreator.ShowPathReach(selectedUnit);
        this.ShowRangeAttackReach(selectedUnit);

        Unibus.Dispatch(AudioController.CARD_SELECTED, selectedUnit.CardDisplay);

        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Subscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
        Unibus.Subscribe<AbilityActivated>(UnitDisplay.ABILITY_ACTIVATED, OnAbilityActivated);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Subscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
        Unibus.Subscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, OnTileMouseEnterOnBoard);
        Unibus.Subscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, OnTileMouseExitOnBoard);
    }

    protected override void Disable()
    {
        base.Disable();
        this.boardCreator.RemoveAllBlinks();
        selectedUnit.HideAbilities();

        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_CLICKED_ON_BOARD, OnUnitSelectedOnBoard);
        Unibus.Unsubscribe<Point>(BoardCreator.CLICKED_ON_VOID_TILE, OnClickedOnVoidTile);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_ENTER_ON_BOARD, OnUnitMouseEnterOnBoard);
        Unibus.Unsubscribe<UnitDisplay>(BoardCreator.UNIT_MOUSE_EXIT_ON_BOARD, OnUnitMouseExitOnBoard);
        Unibus.Unsubscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_ENTER_ON_BOARD, OnTileMouseEnterOnBoard);
        Unibus.Unsubscribe<TileDisplay>(BoardCreator.TILE_WITHOUT_UNIT_MOUSE_EXIT_ON_BOARD, OnTileMouseExitOnBoard);
        Unibus.Unsubscribe<AbilityActivated>(UnitDisplay.ABILITY_ACTIVATED, OnAbilityActivated);
    }

    protected override void EnableNoSelectionsState()
    {
        this.selectedUnit.CardDisplay.Unselect();
        Disable();
        this.states.noSelectionsState.Enable();
    }

    private void AttackEnemy(UnitDisplay enemyDisplay)
    {
        this.actionEmmiter.EmmitCardAttackAction(this.selectedUnit, enemyDisplay);

        this.EnableNoSelectionsState();
    }

    private void UseManaAbility()
    {
        this.actionEmmiter.EmmitCardUseManaAbilityAction(this.selectedUnit);

        this.EnableNoSelectionsState();
    }

    private void ToAim()
    {
        this.actionEmmiter.EmmitCardToAimAction(this.selectedUnit);

        this.EnableNoSelectionsState();
    }

    private void MoveUnit(Point point)
    {
        this.actionEmmiter.EmmitCardMoveAction(this.selectedUnit, point);

        this.EnableNoSelectionsState();
    }

    private void ChangeSelectedToAnotherAlly(UnitDisplay unitDisplay)
    {
        this.selectedUnit.CardDisplay.Unselect();
        this.Disable();
        this.states.ownUnitSelectedState.Enable(unitDisplay);
    }

    private void EnableSelectingPushTargetState(UnitDisplay unitDisplay)
    {
        this.Disable();
        this.states.selectingPushTargetState.Enable(this.selectedUnit, unitDisplay);
    }

    private void EnableSelectingRicochetTargetState(UnitDisplay unitDisplay)
    {
        this.Disable();
        this.states.selectingRicochetTargetState.Enable(this.selectedUnit, unitDisplay);
    }

    private void EnableSelectingHealingTargetState(HealingAbility ability)
    {
        this.Disable();
        this.states.selectingHealingTargetState.Enable(this.selectedUnit, ability);
    }

    private void OnUnitSelectedOnBoard(UnitDisplay clickedUnitDisplay)
    {
        if (clickedUnitDisplay.CardDisplay.IsAlly)
        {
            if (!clickedUnitDisplay.CardData.tapped)
            {
                this.ChangeSelectedToAnotherAlly(clickedUnitDisplay);
            }
        }
        else
        {
            if (this.selectedUnit.CardData.abilities.push != null)
            {
                this.EnableSelectingPushTargetState(clickedUnitDisplay);
            }
            else if (this.selectedUnit.CardData.abilities.ricochet && this.boardCreator.UnitHaveRicochetTargetNearby(clickedUnitDisplay))
            {
                this.EnableSelectingRicochetTargetState(clickedUnitDisplay);
            }
            else
            {
                this.AttackEnemy(clickedUnitDisplay);
            }
        }
    }

    private void OnClickedOnVoidTile(Point point)
    {
        this.MoveUnit(point);
    }

    private void OnUnitMouseEnterOnBoard(UnitDisplay unit)
    {
        if (!unit.CardDisplay.IsAlly)
        {
            this.boardCreator.RemoveAllBlinks();
            Point attackerPosition = this.boardCreator.GetUnitPosition(this.selectedUnit);
            this.ShowRangeAttackReach(this.selectedUnit, attackerPosition);
            this.boardCreator.ShowPathReach(this.selectedUnit);
        } else if (unit.CardDisplay == this.selectedUnit)
        {
            this.boardCreator.RemoveAllBlinks();
            this.boardCreator.ShowPathReach(this.selectedUnit);
            this.ShowRangeAttackReach(this.selectedUnit);
        } else
        {
            this.boardCreator.RemoveAllBlinks();
            this.boardCreator.ShowPathReach(unit);
            this.ShowRangeAttackReach(unit);
        }
    }

    private void OnUnitMouseExitOnBoard(UnitDisplay unit)
    {
        this.boardCreator.RemoveAllBlinks();
        this.boardCreator.ShowPathReach(this.selectedUnit);
    }

    private void OnTileMouseEnterOnBoard(TileDisplay tile)
    {
        this.boardCreator.RemoveAllBlinks();

        Point fromPosition = this.boardCreator.GetTilePosition(tile);
        this.ShowRangeAttackReach(this.selectedUnit, fromPosition);

        this.boardCreator.ShowPathReach(this.selectedUnit);
    }

    private void OnTileMouseExitOnBoard(TileDisplay tile)
    {
        this.boardCreator.RemoveAllBlinks();
        this.boardCreator.ShowPathReach(this.selectedUnit);
    }

    private void OnAbilityActivated(AbilityActivated abilityActivated)
    {
        if (abilityActivated.ability is HealingAbility)
        {
            this.EnableSelectingHealingTargetState(abilityActivated.ability as HealingAbility);
        }

        if (abilityActivated.ability is ManaAbility)
        {
            this.UseManaAbility();
        }

        if (abilityActivated.ability is AimingAbility)
        {
            this.ToAim();
        }
    }

    private void ShowRangeAttackReach(UnitDisplay unit, Point fromPosition = null)
    {
        if (unit.CardData.abilities.range != null)
        {
            if (fromPosition == null)
            {
                fromPosition = this.boardCreator.GetUnitPosition(unit);
            }
            this.boardCreator.ShowRangeAttackReach(unit, fromPosition);
        }
    }
}
