const nanoid = require('nanoid');

import { Event } from './Event';

type EntityId = string;

class Entity {
  public changes: Array<Event> = [];
  protected state: EntityState;

  protected apply (event: Event): void {
    this.state.mutate(event);
    this.changes.push(event);
  }

  protected generateId (): EntityId {
    return nanoid();
  }
}

abstract class EntityState {
  public abstract mutate (event: Event): void;

  protected applyEvents (events: Array<Event>): void {
    events.forEach(event => this.mutate(event));
  }

}

export {Entity, EntityState, EntityId};
