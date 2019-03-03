import { Player } from '../../domain/player/Player';
import { Repository } from '../../infr/repositories/Repository';
import { Game } from '../../domain/game/Game';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { CardEventType } from '../../domain/events';
import { UseCase } from '../../infr/UseCase';
import { Point } from '../../infr/Point';
import { Board } from '../../domain/board/Board';

interface MoveCardParams {
  gameId: EntityId;
  playerId: EntityId;
  cardId: EntityId;
  position: Point;
}

interface MoveCardAction {
  type: string;
  cardId?: EntityId;
  playerId?: EntityId;
  position?: Point;
  currentMovingPoints?: number;
}

class MoveCardUseCase extends UseCase {
  protected action: MoveCardAction = {
    type: 'MoveCardAction'
  };

  protected entities: {
    game?: Game;
    player?: Player,
    card?: Card
    board?: Board
  } = {};

  protected params: MoveCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);
    this.entities.player = await Repository.get<Player>(this.params.playerId, Player);
    this.entities.card = await Repository.get<Card>(this.params.cardId, Card);
    this.entities.board = await Repository.get<Board>(this.entities.game.boardId, Board);
  }

  protected addEventListeners (): void {
    this.entities.card.addEventListener(CardEventType.CARD_MOVED, this.onCardMoved);
  }

  protected runBusinessLogic (): void {
    this.entities.player.moveCard(
      this.entities.card, this.params.position, this.entities.board
    );
  }

  protected addClientActions (): void {
    this.action.cardId = this.entities.card.id;
    this.action.playerId = this.entities.player.id;
    this.action.position = this.params.position;
  }

  @boundMethod
  private onCardMoved (event: Event<CardData>): void {
    this.action.currentMovingPoints = event.data.currentMovingPoints;
  }
}

export {MoveCardUseCase};
