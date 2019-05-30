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


interface HealCardParams {
  gameId: EntityId;
  playerId: EntityId;
  healerCardId: EntityId;
  healedCardId: EntityId;
}

interface CardChanges {
  id?: string;
  isTapped?: boolean;
  newHp?: number;
}

interface CardHealedAction {
  type: string;
  healerCard: CardChanges;
  healedCard: CardChanges;
}

class HealCardUseCase extends UseCase {
  protected action: CardHealedAction = {
    type: 'CardHealedAction',
    healerCard: {},
    healedCard: {},
  };

  protected entities: {
    game?: Game;
    player?: Player,
    opponent?: Player,
    healerCard?: Card,
    healedCard?: Card,
    board?: Board,
  } = {};

  protected params: HealCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);
    this.entities.board = await Repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.player = await Repository.get<Player>(this.params.playerId, Player);
    let opponent = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.playerId);
    this.entities.opponent = await Repository.get<Player>(opponent, Player);
    this.entities.healerCard = await Repository.get<Card>(this.params.healerCardId, Card);
    this.entities.healedCard = await Repository.get<Card>(this.params.healedCardId, Card);
  }

  protected addEventListeners (): void {
    this.entities.healerCard.addEventListener(CardEventType.CARD_TAPPED, this.onHealerCardTapped);
    this.entities.healedCard.addEventListener(CardEventType.CARD_HEALED, this.onHealedCardHpChanged);
  }

  protected runBusinessLogic (): void {
    this.entities.player.healCard(
      this.entities.healerCard,
      this.entities.healedCard,
      this.entities.board,
      this.entities.opponent,
    );
  }

  protected addClientActions (): void {
    this.action.healerCard.id = this.params.healerCardId;
    this.action.healedCard.id = this.params.healedCardId;
  }

  @boundMethod
  private onHealerCardTapped (event: Event<CardData>): void {
    this.action.healerCard.isTapped = true;
  }

  @boundMethod
  private onHealedCardHpChanged (event: Event<CardData>): void {
    this.action.healedCard.newHp = event.data.currentHp;
  }
}

export {HealCardUseCase};
