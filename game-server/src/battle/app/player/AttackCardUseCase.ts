import { Player } from '../../domain/player/Player';
import { Board } from '../../domain/board/Board';
import { Game } from '../../domain/game/Game';
import { BoardCardMovedExtra, BoardEventType, CardEventType, CardMovedExtra } from '../../domain/events';
import { MeleeAttackService } from '../../domain/attackService/MeleeAttackService';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { UseCase } from '../../infr/UseCase';
import { RangeAttackService } from '../../domain/attackService/RangeAttackService';
import { Point } from '../../infr/Point';
import { Area } from '../../domain/area/Area';

// TODO: Возможно нужный отдельный ивент для перемещения карты в гв.

interface AttackCardParams {
  gameId: EntityId;
  attackerPlayerId: EntityId;
  attackerCardId: EntityId;
  attackedCardId: EntityId;
  isRangeAttack: boolean;
  abilitiesParams: AbilitiesParams;
}

interface AbilitiesParams {
  pushAt?: Point;
  ricochetTargetCardId?: EntityId;
}

interface CardChanges {
  id?: string;
  isTapped?: boolean;
  isUntapped?: boolean;
  newHp?: number;
  killed?: boolean;
  currentMovingPoints?: number;
  pushedTo?: Point;
  usedInThisTurnBlockAbility?: boolean;
  usedInThisTurnEvasionAbility?: boolean;
  blockedRangeAbilityInBeginningOfTurn?: boolean;
  isPoisoned?: boolean;
  poisonDamage?: number;
  isDamageCursed?: boolean;
  damageCursedDamageReduction?: number;
  damage?: number;
  hpAuraBuffChange?: number;
  numberOfAiming?: number;
}

interface CardAttackedAction {
  type: string;
  attackerCardId: EntityId;
  attackedCardId: EntityId;
  cardChanges: CardChanges[];
}

class AttackCardUseCase extends UseCase<AttackCardParams> {
  protected action: CardAttackedAction = {
    type: 'CardAttackedAction',
    attackerCardId: '',
    attackedCardId: '',
    cardChanges: []
  };

  protected entities: {
    game?: Game;
    attackerPlayer?: Player,
    attackedPlayer?: Player,
    attackerCard?: Card,
    attackedCard?: Card,
    board?: Board,
    attackerPlayerTableCards?: Card[],
    attackedPlayerTableCards?: Card[],
    areas?: Area[],
  } = {};

  protected params: AttackCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await this.repository.get<Game>(this.params.gameId, Game);
    this.entities.board = await this.repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.attackerPlayer = await this.repository.get<Player>(this.params.attackerPlayerId, Player);
    let attackedPlayerId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.attackerPlayerId);
    this.entities.attackedPlayer = await this.repository.get<Player>(attackedPlayerId, Player);
    this.entities.attackerCard = await this.repository.get<Card>(this.params.attackerCardId, Card);
    this.entities.attackedCard = await this.repository.get<Card>(this.params.attackedCardId, Card);
    this.entities.attackerPlayerTableCards = await this.repository.getMany<Card>(this.entities.attackerPlayer.table, Card);
    this.entities.attackedPlayerTableCards = await this.repository.getMany<Card>(this.entities.attackedPlayer.table, Card);
    this.entities.areas = await this.repository.getMany<Area>(this.entities.board.areas, Area);
  }

  protected addEventListeners (): void {
    let allCards = this.entities.attackerPlayerTableCards.concat(this.entities.attackedPlayerTableCards);

    for (let card of allCards) {
      card.addEventListener(CardEventType.CARD_TAPPED, this.onCardTapped);
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
      card.addEventListener(CardEventType.CARD_HEALED, this.onCardHpChanged);
      card.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onCardHpChanged);
      card.addEventListener(CardEventType.CARD_DIED, this.onCardDied);
      card.addEventListener(CardEventType.CARD_USE_BLOCK_ABILITY, this.onCardUseBlockAbility);
      card.addEventListener(CardEventType.CARD_USE_EVASION_ABILITY, this.onCardUseEvasionAbility);
      card.addEventListener(CardEventType.CARD_POISONED, this.onCardPoisoned);
      card.addEventListener(CardEventType.CARD_DAMAGE_CURSED, this.onCardDamageCursed);
      card.addEventListener(CardEventType.CARD_ATTACK_WITH_AIM, this.onCardAttackWithAim);
    }

    this.entities.board.addEventListener(BoardEventType.CARD_MOVED, this.onCardMoved);
  }

  protected runBusinessLogic (): void {
    if (this.params.isRangeAttack) {
      RangeAttackService.rangeAttackUnit(
        this.entities.attackerCard, this.entities.attackedCard, this.entities.attackerPlayer, this.entities.attackedPlayer,
        this.entities.board, this.entities.attackedPlayerTableCards, this.entities.areas, this.params.abilitiesParams
      );
    } else {
      MeleeAttackService.meleeAttackUnit(
        this.entities.attackerCard, this.entities.attackedCard, this.entities.attackerPlayer, this.entities.attackedPlayer,
        this.entities.board, this.entities.attackerPlayerTableCards,
        this.entities.attackedPlayerTableCards, this.entities.areas, this.params.abilitiesParams
      );
    }
  }

  protected addClientActions (): void {
    this.action.attackerCardId = this.params.attackerCardId;
    this.action.attackedCardId = this.params.attackedCardId;
  }

  @boundMethod
  private onCardTapped (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.isTapped = true;
    cardChanges.currentMovingPoints = event.data.currentMovingPoints;
  }

  @boundMethod
  private onCardHpChanged (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.newHp = event.data.currentHp;
  }

  @boundMethod
  private onCardUntapped (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.isUntapped = true;
  }

  @boundMethod
  private onCardDied (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.killed = !event.data.alive;
  }

  @boundMethod
  private onCardUseBlockAbility (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.usedInThisTurnBlockAbility = event.data.abilities.block.usedInThisTurn;
  }

  @boundMethod
  private onCardUseEvasionAbility (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.usedInThisTurnEvasionAbility = event.data.abilities.evasion.usedInThisTurn;
  }

  @boundMethod
  private onCardPoisoned (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.isPoisoned = true;
    cardChanges.poisonDamage = event.data.negativeEffects.poisoned.damage;
  }

  @boundMethod
  private onCardDamageCursed (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.isDamageCursed = true;
    cardChanges.damageCursedDamageReduction = event.data.negativeEffects.damageCursed.damageReduction;
    cardChanges.damage = event.data.damage;
  }

  @boundMethod
  private onCardAttackWithAim (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.numberOfAiming = event.data.abilities.aiming.numberOfAiming;
  }

  @boundMethod
  private onCardMoved (event: Event<CardData, BoardCardMovedExtra>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.extra.movedCardId);

    cardChanges.pushedTo = event.extra.toPosition;
  }
}

export {AttackCardUseCase, AbilitiesParams, CardChanges};
