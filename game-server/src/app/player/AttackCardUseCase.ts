import { Player } from '../../domain/player/Player';
import { Repository } from '../../infr/repositories/Repository';
import { Board } from '../../domain/board/Board';
import { Game } from '../../domain/game/Game';
import { CardEventType } from '../../domain/events';
import { MeleeAttackService } from '../../domain/attackService/MeleeAttackService';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { UseCase } from '../../infr/UseCase';
import { RangeAttackService } from '../../domain/attackService/RangeAttackService';

// TODO: Возможно нужный отдельный ивент для перемещения карты в гв.

interface AttackCardParams {
  gameId: EntityId;
  attackerPlayerId: EntityId;
  attackerCardId: EntityId;
  attackedCardId: EntityId;
  isRangeAttack: boolean;
}

interface CardChanges {
  id?: string;
  isTapped?: boolean;
  isUntapped?: boolean;
  newHp?: number;
  killed?: boolean;
  currentMovingPoints?: number;
}

interface CardAttackedAction {
  type: string;
  attackerCard: CardChanges;
  attackedCard: CardChanges;
  otherCards: CardChanges[];
}

class AttackCardUseCase extends UseCase {
  protected action: CardAttackedAction = {
    type: 'CardAttackedAction',
    attackerCard: {},
    attackedCard: {},
    otherCards: []
  };

  protected entities: {
    game?: Game;
    attackerPlayer?: Player,
    attackedPlayer?: Player,
    attackerCard?: Card,
    attackedCard?: Card,
    board?: Board,
    attackedPlayerTableCards?: Card[],
  } = {};

  protected params: AttackCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);
    this.entities.board = await Repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.attackerPlayer = await Repository.get<Player>(this.params.attackerPlayerId, Player);
    let attackedPlayerId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.attackerPlayerId);
    this.entities.attackedPlayer = await Repository.get<Player>(attackedPlayerId, Player);
    this.entities.attackerCard = await Repository.get<Card>(this.params.attackerCardId, Card);
    this.entities.attackedCard = await Repository.get<Card>(this.params.attackedCardId, Card);
    this.entities.attackedPlayerTableCards = await Repository.getMany<Card>(this.entities.attackedPlayer.table, Card);
  }

  protected addEventListeners (): void {
    this.entities.attackerCard.addEventListener(CardEventType.CARD_TAPPED, this.onAttackerCardTapped);
    this.entities.attackerCard.addEventListener(CardEventType.CARD_UNTAPPED, this.onAttackerCardUntapped);
    this.entities.attackerCard.addEventListener(CardEventType.CARD_HEALED, this.onAttackerCardHpChanged);
    this.entities.attackerCard.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onAttackerCardHpChanged);
    this.entities.attackerCard.addEventListener(CardEventType.CARD_DIED, this.onAttackerCardDied);

    this.entities.attackedCard.addEventListener(CardEventType.CARD_TAPPED, this.onAttackedCardTapped);
    this.entities.attackedCard.addEventListener(CardEventType.CARD_UNTAPPED, this.onAttackedCardUntapped);
    this.entities.attackedCard.addEventListener(CardEventType.CARD_HEALED, this.onAttackedCardHpChanged);
    this.entities.attackedCard.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onAttackedCardHpChanged);
    this.entities.attackedCard.addEventListener(CardEventType.CARD_DIED, this.onAttackedCardDied);

    for (let card of this.entities.attackedPlayerTableCards) {
      if (card.id !== this.entities.attackedCard.id) {
        card.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onCardHpChanged);
        card.addEventListener(CardEventType.CARD_DIED, this.onCardDied);
        card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
      }
    }
  }

  protected runBusinessLogic (): void {
    if (this.params.isRangeAttack) {
      RangeAttackService.rangeAttackUnit(
        this.entities.attackerCard, this.entities.attackedCard, this.entities.attackerPlayer,
        this.entities.attackedPlayer, this.entities.board, this.entities.attackedPlayerTableCards
      );
    } else {
      MeleeAttackService.meleeAttackUnit(
        this.entities.attackerCard, this.entities.attackedCard, this.entities.attackerPlayer,
        this.entities.attackedPlayer, this.entities.board, this.entities.attackedPlayerTableCards
      );
    }
  }

  protected addClientActions (): void {
    this.action.attackerCard.id = this.params.attackerCardId;
    this.action.attackedCard.id = this.params.attackedCardId;
  }

  @boundMethod
  private onAttackerCardTapped (event: Event<CardData>): void {
    this.action.attackerCard.isTapped = true;
    this.action.attackerCard.currentMovingPoints = event.data.currentMovingPoints;
  }

  @boundMethod
  private onAttackerCardHpChanged (event: Event<CardData>): void {
    this.action.attackerCard.newHp = event.data.currentHp;
  }

  @boundMethod
  private onAttackerCardUntapped (event: Event<CardData>): void {
    this.action.attackerCard.isUntapped = true;
  }

  @boundMethod
  private onAttackerCardDied (event: Event<CardData>): void {
    this.action.attackerCard.killed = !event.data.alive;
  }

  @boundMethod
  private onAttackedCardTapped (event: Event<CardData>): void {
    this.action.attackedCard.isTapped = true;
    this.action.attackedCard.currentMovingPoints = event.data.currentMovingPoints;
  }

  @boundMethod
  private onAttackedCardHpChanged (event: Event<CardData>): void {
    this.action.attackedCard.newHp = event.data.currentHp;
  }

  @boundMethod
  private onAttackedCardUntapped (event: Event<CardData>): void {
    this.action.attackedCard.isUntapped = true;
  }

  @boundMethod
  private onAttackedCardDied (event: Event<CardData>): void {
    this.action.attackedCard.killed = !event.data.alive;
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

  private getOrCreateCardChangesById (cardId: EntityId): CardChanges {
    let cardChanges = null;
    for (let card of this.action.otherCards) {
      if (card.id === cardId) {
        cardChanges = card;
      }
    }

    if (!cardChanges) {
      cardChanges = {id: cardId};
      this.action.otherCards.push(cardChanges);
    }

    return cardChanges;
  }
}

export {AttackCardUseCase};
