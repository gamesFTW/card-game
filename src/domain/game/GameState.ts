import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { GameEventType, PlayerEventType } from '../events';

interface GameData {
  id?: EntityId;
  player1Id?: EntityId;
  player2Id?: EntityId;
  currentPlayersTurn?: EntityId;
}

class GameState extends EntityState implements GameData {
  public player1Id: EntityId;
  public player2Id: EntityId;
  public currentPlayersTurn: EntityId;

  public constructor (events: Array<Event<GameData>>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event<GameData>): void {
    if (event.type === GameEventType.GAME_CREATED) {
      this.whenGameCreated(event);
    }
  }

  private whenGameCreated (event: Event<GameData>): void {
    this.id = event.data.id;
    this.player1Id = event.data.player1Id;
    this.player2Id = event.data.player2Id;
    this.currentPlayersTurn = event.data.currentPlayersTurn;
  }
}

export {GameState, GameData};
