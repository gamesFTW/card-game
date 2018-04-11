const generate = require('nanoid/generate');

import { Event } from './Event';

type EntityId = string;

class Entity {
  public changes: Array<Event<any>> = [];
  protected state: EntityState;

  public get id (): EntityId { return this.state.id; }

  protected applyEvent (event: Event<any>): void {
    this.state.mutate(event);
    this.changes.push(event);
  }

  protected generateId (): EntityId {
    return generate('1234567890qwertyuiopasdfghjklzxcvbnm', 30);
  }
}

abstract class EntityState {
  public id: EntityId;

  public abstract mutate (event: Event<any>): void;

  protected applyEvents (events: Array<Event<any>>): void {
    events.forEach(event => this.mutate(event));
  }
}

export {Entity, EntityState, EntityId};
