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

  public async execute (gameId: EntityId, endingTurnPlayerId: EntityId): Promise<void> {
    let game = await Repository.get<Game>(gameId, Game);

    let endingTurnPlayerOpponentId = game.getPlayerIdWhichIsOpponentFor(endingTurnPlayerId);

    let endingTurnPlayer = await Repository.get<Player>(endingTurnPlayerId, Player);
    let endingTurnPlayerOpponent = await Repository.get<Player>(endingTurnPlayerOpponentId, Player);

    let endingTurnPlayerMannaPoolCards = await Repository.getMany <Card>(endingTurnPlayer.mannaPool, Card);
    let endingTurnPlayerTableCards = await Repository.getMany <Card>(endingTurnPlayer.table, Card);

    endingTurnPlayerMannaPoolCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_ADDED_CURRENT_MOVING_POINTS, this.onCardAddedCurrentMovingPoints);
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });

    endingTurnPlayerTableCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });

    endingTurnPlayer.addEventListener(PlayerEventType.CARD_DRAWN, this.onCardDrawn);

    game.endTurn(endingTurnPlayer, endingTurnPlayerOpponent, endingTurnPlayerMannaPoolCards, endingTurnPlayerTableCards);

    let entities = [
      game, endingTurnPlayer, endingTurnPlayerOpponent,
      endingTurnPlayerMannaPoolCards, endingTurnPlayerTableCards
    ];
    await Repository.save(entities);

    this.endTurnAction.currentTurn = game.currentTurn;
    this.endTurnAction.endedPlayerId = endingTurnPlayerId;
    this.endTurnAction.startedPlayerId = endingTurnPlayerOpponentId;

    console.log(this.endTurnAction);

    // Send data to client
    godOfSockets.sendActions(game.id, [this.endTurnAction]);
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
