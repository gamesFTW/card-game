import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { PlayerState } from './PlayerState';
import { PlayerCreated } from './PlayerEvents';

class Player extends Entity {
  protected state: PlayerState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new PlayerState(events);
  }

  get id (): EntityId { return this.state.id; }

  public create (): void {
    let id = this.generateId();

    this.apply(new PlayerCreated(
      {id}
    ));
  }
}

export {Player};
