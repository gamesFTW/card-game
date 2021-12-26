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
  position?: Point;
  targetCardId?: EntityId;
  isSpendAllMovingPoints?: boolean;
}

interface MoveCardAction {
  type: string;
  cardId?: EntityId;
  playerId?: EntityId;
  position?: Point;
  path?: Point[];
  currentMovingPoints?: number;
}

class MoveCardUseCase extends UseCase<MoveCardParams> {
  protected action: MoveCardAction = {
    type: 'MoveCardAction'
  };

  protected entities: {
    game?: Game;
    player?: Player,
    opponent?: Player,
    movedCard?: Card,
    targetCard?: Card,
    board?: Board,
    areas?: Area[],
    movedCardPlayerTableCards?: Card[],
    targetCardPlayerTableCards?: Card[]
  } = {};

  protected params: MoveCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await this.repository.get<Game>(this.params.gameId, Game);
    this.entities.player = await this.repository.get<Player>(this.params.playerId, Player);
    let opponentId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.playerId);
    this.entities.opponent = await this.repository.get<Player>(opponentId, Player);
    this.entities.movedCard = await this.repository.get<Card>(this.params.cardId, Card);
    this.entities.board = await this.repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.areas = await this.repository.getMany<Area>(this.entities.board.areas, Area);

    if (this.params.targetCardId) {
      this.entities.targetCard = await this.repository.get<Card>(this.params.targetCardId, Card);
      this.entities.movedCardPlayerTableCards = await this.repository.getMany<Card>(this.entities.player.table, Card);
      this.entities.targetCardPlayerTableCards = await this.repository.getMany<Card>(this.entities.opponent.table, Card);
    }
  }

  protected addEventListeners (): void {
    this.entities.movedCard.addEventListener(CardEventType.CARD_MOVED, this.onCardMoved);
  }

  protected runBusinessLogic (): void {
    if (this.params.position) {
      this.entities.player.moveCard(
        this.entities.movedCard, this.params.position, this.entities.board, this.entities.opponent,
        this.entities.areas, this.params.isSpendAllMovingPoints
      );
    } else {
      this.entities.player.moveCardToCard(
        this.entities.movedCard, this.entities.targetCard, this.entities.board, this.entities.opponent,
        this.entities.areas, this.entities.movedCardPlayerTableCards, this.entities.targetCardPlayerTableCards
      );
    }
  }

  protected addClientActions (): void {
    this.action.cardId = this.entities.movedCard.id;
    this.action.playerId = this.entities.player.id;
  }

  @boundMethod
  private onCardMoved (event: Event<CardData, CardMovedExtra>): void {
    this.action.currentMovingPoints = event.data.currentMovingPoints;
    this.action.path = event.extra.path;
    this.action.position = event.extra.path[event.extra.path.length - 1];
  }
}

export {MoveCardUseCase};
