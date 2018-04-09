import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { GameCreated } from './GameEvents';

class GameState extends EntityState {
  public player1Id: EntityId;
  public player2Id: EntityId;
  public currentPlayersTurn: EntityId;

  public constructor (events: Array<Event>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event): void {
    if (event instanceof GameCreated) {
      this.whenGameCreated(event as GameCreated);
    }
  }

  private whenGameCreated (event: GameCreated): void {
    this.id = event.data.id;
    this.player1Id = event.data.player1Id;
    this.player2Id = event.data.player2Id;
    this.currentPlayersTurn = event.data.currentPlayersTurn;
  }
}

export {GameState};
