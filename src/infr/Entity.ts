import {Event} from "./Event";

type EntityId = string;

class Entity {
  public changes: Array<Event> = [];
  public state: EntityState;

  protected apply(event: Event) {
    this.state.mutate(event);
    this.changes.push(event);
  }
}

class EntityState {
  public constructor(events: Array<Event>) {
    events.forEach(event => this.mutate(event));
  }

  public mutate(event: Event) {}
}

export {Entity, EntityState, EntityId};
