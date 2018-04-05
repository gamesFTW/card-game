import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { GameCreated } from '../game/GameEvents';
import { PlayerCreated } from './PlayerEvents';

class PlayerState extends EntityState {
  public constructor (events: Array<Event>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event): void {
    if (event instanceof PlayerCreated) {
      this.whenPlayerCreated(event as PlayerCreated);
    }
  }

  private whenPlayerCreated (event: PlayerCreated) {
    this.id = event.data.id;
  }
}

export {PlayerState};
