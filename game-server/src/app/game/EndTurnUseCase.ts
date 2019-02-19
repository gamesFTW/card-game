import { Player } from '../../domain/player/Player';
import { Repository } from '../../infr/repositories/Repository';
import { Game } from '../../domain/game/Game';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import {CardEventType, PlayerDrawnCardData, PlayerEventType} from '../../domain/events';
import {GameData} from '../../domain/game/GameState';
import { UseCase } from '../../infr/UseCase';

// TODO: Возможно нужный отдельный ивент для перемещения карты в гв.
interface EndTurnParams {
  gameId: string;
  endingTurnPlayerId: string;
}

interface EndTurnAction {
  type: string;
  currentTurn?: number;
  endedPlayerId?: string;
  startedPlayerId?: string;
  cardsMovingPointsUpdated?: Array<{id: string; currentMovingPoints: number}>;
  cardsUntapped?: Array<EntityId>;
  cardsDrawn?: Array<EntityId>;
}

class EndTurnUseCase extends UseCase {
  protected action: EndTurnAction = {
    type: 'EndTurnAction',
    cardsMovingPointsUpdated: [],
    cardsUntapped: [],
    cardsDrawn: []
  };

  protected entities: {
    game?: Game;
    endingTurnPlayer?: Player;
    endingTurnPlayerOpponent?: Player;
    endingTurnPlayerMannaPoolCards?: Card[];
    endingTurnPlayerTableCards?: Card[];
  } = {};

  protected params: EndTurnParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);

    let endingTurnPlayerOpponentId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.endingTurnPlayerId);

    this.entities.endingTurnPlayer = await Repository.get<Player>(this.params.endingTurnPlayerId, Player);
    this.entities.endingTurnPlayerOpponent = await Repository.get<Player>(endingTurnPlayerOpponentId, Player);

    this.entities.endingTurnPlayerMannaPoolCards = await Repository.getMany <Card>(this.entities.endingTurnPlayer.mannaPool, Card);
    this.entities.endingTurnPlayerTableCards = await Repository.getMany <Card>(this.entities.endingTurnPlayer.table, Card);
  }

  protected addEventListeners (): void {
    this.entities.endingTurnPlayerMannaPoolCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_ADDED_CURRENT_MOVING_POINTS, this.onCardAddedCurrentMovingPoints);
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });

    this.entities.endingTurnPlayerTableCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });

    this.entities.endingTurnPlayer.addEventListener(PlayerEventType.CARD_DRAWN, this.onCardDrawn);
  }

  protected runBusinessLogic (): void {
    this.entities.game.endTurn(
      this.entities.endingTurnPlayer, this.entities.endingTurnPlayerOpponent,
      this.entities.endingTurnPlayerMannaPoolCards, this.entities.endingTurnPlayerTableCards
    );
  }

  protected addClientActions (): void {
    this.action.currentTurn = this.entities.game.currentTurn;
    this.action.endedPlayerId = this.params.endingTurnPlayerId;
    this.action.startedPlayerId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.endingTurnPlayerId);
  }

  @boundMethod
  private onGameEnded (event: Event<GameData>): void {
    this.action.currentTurn = event.data.currentTurn;
  }

  @boundMethod
  private onCardAddedCurrentMovingPoints (event: Event<CardData>): void {
    this.action.cardsMovingPointsUpdated.push({id: event.data.id, currentMovingPoints: event.data.currentMovingPoints})
  }

  @boundMethod
  private onCardUntapped (event: Event<CardData>): void {
    this.action.cardsUntapped.push(event.data.id);
  }

  @boundMethod
  private onCardDrawn (event: Event<CardData, PlayerDrawnCardData>): void {
    this.action.cardsDrawn.push(event.extra.drawnCard);
  }
}

export {EndTurnUseCase};
