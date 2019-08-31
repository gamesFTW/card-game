import { Player } from '../../domain/player/Player';
import { Game } from '../../domain/game/Game';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { CardEventType, CardMovedExtra } from '../../domain/events';
import { UseCase } from '../../infr/UseCase';
import { Point } from '../../infr/Point';
import { Board } from '../../domain/board/Board';
import { Area } from '../../domain/area/Area';

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
  path?: Point[];
  currentMovingPoints?: number;
}

class MoveCardUseCase extends UseCase {
  protected action: MoveCardAction = {
    type: 'MoveCardAction'
  };

  protected entities: {
    game?: Game;
    player?: Player,
    opponent?: Player,
    card?: Card
    board?: Board
    areas?: Area[]
  } = {};

  protected params: MoveCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await this.repository.get<Game>(this.params.gameId, Game);
    this.entities.player = await this.repository.get<Player>(this.params.playerId, Player);
    let opponentId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.playerId);
    this.entities.opponent = await this.repository.get<Player>(opponentId, Player);
    this.entities.card = await this.repository.get<Card>(this.params.cardId, Card);
    this.entities.board = await this.repository.get<Board>(this.entities.game.boardId, Board);
    try {
      this.entities.areas = await this.repository.getMany<Area>(this.entities.board.areas, Area);
    } catch (e) {
      console.log(this.entities.game);
      console.log('board id', this.entities.game.boardId);
      throw e;
    }
  }

  protected addEventListeners (): void {
    this.entities.card.addEventListener(CardEventType.CARD_MOVED, this.onCardMoved);
  }

  protected runBusinessLogic (): void {
    this.entities.player.moveCard(
      this.entities.card, this.params.position, this.entities.board, this.entities.opponent, this.entities.areas
    );
  }

  protected addClientActions (): void {
    this.action.cardId = this.entities.card.id;
    this.action.playerId = this.entities.player.id;
    this.action.position = this.params.position;
  }

  @boundMethod
  private onCardMoved (event: Event<CardData, CardMovedExtra>): void {
    this.action.currentMovingPoints = event.data.currentMovingPoints;
    this.action.path = event.extra.path;
  }
}

export {MoveCardUseCase};
