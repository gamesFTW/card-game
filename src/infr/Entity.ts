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
  [key: string]: any;
  public id: EntityId;

  // TODISCUSS:
  // Не нужно делать конструктор с вызовом applyEvents.
  // Тогда дефолтные параметры стейта будут перетирать параметры
  // полученные в результате работы autoApplyEvent.

  public mutate (event: Event<any>): void {
    let methodName = 'when' + event.type;

    if (this[methodName]) {
      this[methodName](event);
    } else {
      this.autoApplyEvent(event);
    }
  }

  protected applyEvents (events: Array<Event<any>>): void {
    events.forEach(event => this.mutate(event));
  }

  protected autoApplyEvent (event: Event<any>): void {
    let data = event.data;
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        // TODISCUSS:
        // Странно, что мы передаём id каждый раз, и каждый раз
        // он будет накатываться. Хотя пока не вижу какие проблемы это может создать.
        this[key] = data[key];
      }
    }
  }
}

export {Entity, EntityState, EntityId};
