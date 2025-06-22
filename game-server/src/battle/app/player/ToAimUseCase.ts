import { Player } from '../../domain/player/Player';
import { Board } from '../../domain/board/Board';
import { Game } from '../../domain/game/Game';
import { CardEventType } from '../../domain/events';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { UseCase } from '../../infr/UseCase';
import { CardChanges } from './AttackCardUseCase';

interface CardToAimParams {
  gameId: EntityId;
  playerId: EntityId;
  cardId: EntityId;
}

interface CardAimedAction {
  type: string;
  playerId?: string;
  tappedCardId?: string;
  cardChanges: CardChanges[];
}

class ToAimUseCase extends UseCase<CardToAimParams> {
  protected action: CardAimedAction = {
    type: 'CardAimedAction',
    cardChanges: []
  };

  protected entities: {
    game?: Game;
    player?: Player,
    opponent?: Player,
    card?: Card,
    board?: Board,
  } = {};

  protected params: CardToAimParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await this.repository.get<Game>(this.params.gameId, Game);
    this.entities.board = await this.repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.player = await this.repository.get<Player>(this.params.playerId, Player);
    this.entities.card = await this.repository.get<Card>(this.params.cardId, Card);
  }

  protected addEventListeners (): void {
    this.entities.card.addEventListener(CardEventType.CARD_TAPPED, this.onCardTapped);
    this.entities.card.addEventListener(CardEventType.CARD_AIMED, this.onCardAimed);
  }

  protected runBusinessLogic (): void {
    this.entities.player.toAim(
      this.entities.card
    );
  }

  protected addClientActions (): void {
    this.action.playerId = this.params.playerId;
  }

  @boundMethod
  private onCardTapped (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.isTapped = true;
  }

  @boundMethod
  private onCardAimed (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.numberOfAiming = event.data.abilities.aiming.numberOfAiming;
  }
}

export {ToAimUseCase};
