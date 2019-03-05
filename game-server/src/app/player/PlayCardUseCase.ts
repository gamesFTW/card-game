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
import {Board} from '../../domain/board/Board';

interface PlayCardParams {
  gameId: EntityId;
  playerId: EntityId;
  cardId: EntityId;
  position: Point;
}

interface PlayCardAction {
  type: string;
  cardId?: EntityId;
  tapped?: boolean;
  playerId?: EntityId;
  position?: Point;
  newHp?: number;
  manaCardsTapped?: EntityId[]
}

class PlayCardUseCase extends UseCase {
  protected action: PlayCardAction = {
    type: 'PlayCardAction',
    manaCardsTapped: []
  };

  protected entities: {
    game?: Game;
    player?: Player,
    card?: Card
    board?: Board
    playerManaPoolCards?: Card[]
  } = {};

  protected params: PlayCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);
    this.entities.player = await Repository.get<Player>(this.params.playerId, Player);
    this.entities.card = await Repository.get<Card>(this.params.cardId, Card);
    this.entities.board = await Repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.playerManaPoolCards = await Repository.getMany <Card>(this.entities.player.manaPool, Card);
  }

  protected addEventListeners (): void {
    this.entities.card.addEventListener(CardEventType.CARD_TAPPED, this.onCardTapped);
    this.entities.card.addEventListener(CardEventType.CARD_PLAYED, this.onCardPlayed);

    this.entities.playerManaPoolCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_TAPPED, this.onManaTapped);
    });
  }

  protected runBusinessLogic (): void {
    this.entities.player.playCard(
      this.entities.card, this.entities.playerManaPoolCards, this.params.position, this.entities.board
    );
  }

  protected addClientActions (): void {
    this.action.cardId = this.entities.card.id;
    this.action.playerId = this.entities.player.id;
    this.action.position = this.params.position;
  }

  @boundMethod
  private onCardTapped (event: Event<CardData>): void {
    this.action.tapped = event.data.tapped;
  }

  @boundMethod
  private onManaTapped (event: Event<CardData>): void {
    this.action.manaCardsTapped.push(event.data.id);
  }

  @boundMethod
  private onCardPlayed (event: Event<CardData>): void {
    this.action.newHp = event.data.currentHp;
  }
}

export {PlayCardUseCase};
