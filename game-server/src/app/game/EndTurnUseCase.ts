import { Player } from '../../domain/player/Player';
import { Repository } from '../../infr/repositories/Repository';
import { formatEventsForClient } from '../../infr/Event';
import { godOfSockets } from '../../infr/GodOfSockets';
import { Game } from '../../domain/game/Game';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import {CardEventType, GameEventType, PlayerDrawnCardData, PlayerEventType} from '../../domain/events';
import {GameData} from '../../domain/game/GameState';

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

class EndTurnUseCase {
  private endTurnAction: EndTurnAction = {
    type: 'EndTurnAction',
    cardsMovingPointsUpdated: [],
    cardsUntapped: [],
    cardsDrawn: []
  };

  private entities: {
    game?: Game;
    endingTurnPlayer?: Player;
    endingTurnPlayerOpponent?: Player;
    endingTurnPlayerMannaPoolCards?: Card[];
    endingTurnPlayerTableCards?: Card[];
  } = {};

  private params : EndTurnParams;

  public async execute (params: EndTurnParams): Promise<void> {
    this.params = params;

    await this.readEntities();
    this.addEventListeners();
    this.runBusinessLogic();
    this.addClientActions();

    let entities = [
      this.entities.game, this.entities.endingTurnPlayer, this.entities.endingTurnPlayerOpponent,
      this.entities.endingTurnPlayerMannaPoolCards, this.entities.endingTurnPlayerTableCards
    ];

    await Repository.save(entities);

    // Send data to client
    godOfSockets.sendActions(this.entities.game.id, [this.endTurnAction]);
  }

  private async readEntities () {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);

    let endingTurnPlayerOpponentId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.endingTurnPlayerId);

    this.entities.endingTurnPlayer = await Repository.get<Player>(this.params.endingTurnPlayerId, Player);
    this.entities.endingTurnPlayerOpponent = await Repository.get<Player>(endingTurnPlayerOpponentId, Player);

    this.entities.endingTurnPlayerMannaPoolCards = await Repository.getMany <Card>(this.entities.endingTurnPlayer.mannaPool, Card);
    this.entities.endingTurnPlayerTableCards = await Repository.getMany <Card>(this.entities.endingTurnPlayer.table, Card);
  }

  private addEventListeners () {
    this.entities.endingTurnPlayerMannaPoolCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_ADDED_CURRENT_MOVING_POINTS, this.onCardAddedCurrentMovingPoints);
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });

    this.entities.endingTurnPlayerTableCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });

    this.entities.endingTurnPlayer.addEventListener(PlayerEventType.CARD_DRAWN, this.onCardDrawn);
  }

  private runBusinessLogic () {
    this.entities.game.endTurn(
      this.entities.endingTurnPlayer, this.entities.endingTurnPlayerOpponent,
      this.entities.endingTurnPlayerMannaPoolCards, this.entities.endingTurnPlayerTableCards
    );
  }

  private addClientActions () {
    this.endTurnAction.currentTurn = this.entities.game.currentTurn;
    this.endTurnAction.endedPlayerId = this.params.endingTurnPlayerId;
    this.endTurnAction.startedPlayerId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.endingTurnPlayerId);
  }

  @boundMethod
  private onGameEnded (event: Event<GameData>): void {
    this.endTurnAction.currentTurn = event.data.currentTurn;
  }

  @boundMethod
  private onCardAddedCurrentMovingPoints (event: Event<CardData>): void {
    this.endTurnAction.cardsMovingPointsUpdated.push({id: event.data.id, currentMovingPoints: event.data.currentMovingPoints})
  }

  @boundMethod
  private onCardUntapped (event: Event<CardData>): void {
    this.endTurnAction.cardsUntapped.push(event.data.id);
  }

  @boundMethod
  private onCardDrawn (event: Event<CardData, PlayerDrawnCardData>): void {
    this.endTurnAction.cardsDrawn.push(event.extra.drawnCard);
  }
}

export {EndTurnUseCase};
