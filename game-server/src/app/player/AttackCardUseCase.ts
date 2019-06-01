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
}

interface CardAttackedAction {
  type: string;
  attackerCardId: EntityId;
  attackedCardId: EntityId;
  cardChanges: CardChanges[];
}

class AttackCardUseCase extends UseCase {
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
  }

  protected addEventListeners (): void {
    let allCards = this.entities.attackerPlayerTableCards.concat(this.entities.attackedPlayerTableCards);

    for (let card of allCards) {
      card.addEventListener(CardEventType.CARD_TAPPED, this.onCardTapped);
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
      card.addEventListener(CardEventType.CARD_HEALED, this.onCardHpChanged);
      card.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onCardHpChanged);
      card.addEventListener(CardEventType.CARD_DIED, this.onCardDied);
    }

    this.entities.board.addEventListener(BoardEventType.CARD_MOVED, this.onCardMoved);
  }

  protected runBusinessLogic (): void {
    if (this.params.isRangeAttack) {
      RangeAttackService.rangeAttackUnit(
        this.entities.attackerCard, this.entities.attackedCard, this.entities.attackerPlayer, this.entities.attackedPlayer,
        this.entities.board, this.entities.attackedPlayerTableCards, this.params.abilitiesParams
      );
    } else {
      MeleeAttackService.meleeAttackUnit(
        this.entities.attackerCard, this.entities.attackedCard, this.entities.attackerPlayer, this.entities.attackedPlayer,
        this.entities.board, this.entities.attackerPlayerTableCards, this.entities.attackedPlayerTableCards, this.params.abilitiesParams
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
  private onCardMoved (event: Event<CardData, BoardCardMovedExtra>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.extra.movedCardId);

    cardChanges.pushedTo = event.extra.toPosition;
  }

  private getOrCreateCardChangesById (cardId: EntityId): CardChanges {
    let cardChanges = null;
    for (let card of this.action.cardChanges) {
      if (card.id === cardId) {
        cardChanges = card;
      }
    }

    if (!cardChanges) {
      cardChanges = {id: cardId};
      this.action.cardChanges.push(cardChanges);
    }

    return cardChanges;
  }
}

export {AttackCardUseCase, AbilitiesParams};
