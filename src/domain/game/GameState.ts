import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { GameCreated } from './GameEvents';

class GameState extends EntityState {
  public playerId1: EntityId;
  public playerId2: EntityId;

  public constructor (events: Array<Event>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event): void {
    if (event instanceof GameCreated) {
      this.whenGameCreated(event as GameCreated);
    }
  }

  private whenGameCreated (event: GameCreated) {
    this.id = event.data.id;
    this.playerId1 = event.data.playerId1;
    this.playerId2 = event.data.playerId2;
  }
}

export {GameState};
