import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';

class PlayerState extends EntityState {
  public id: EntityId;

  public constructor (events: Array<Event>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event): void {
    console.log(123);
  }
}

export {PlayerState};
