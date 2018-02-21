import { Event } from "./Event";

type EntityId = string;

class Entity {
  public changes: Array<Event> = [];
  protected state: EntityState;

  protected apply (event: Event) {
    this.state.mutate(event);
    this.changes.push(event);
  }
}

class EntityState {
  public mutate (event: Event) {}

  protected applyEvents (events: Array<Event>) {
    events.forEach(event => this.mutate(event));
  }

}

export {Entity, EntityState, EntityId};
