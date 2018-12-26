const generate = require('nanoid/generate');

import { Event } from './Event';

type EntityId = string;

class Entity {
  public changes: Array<Event<any>> = [];
  public get id (): EntityId { return this.state.id; }

  protected state: EntityState;
  private listeners: {[type: string]: Array<Function>} = {};

  public addEventListener (type: string, callback: Function): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  protected applyEvent (event: Event<any>): void {
    event.orderIndex = Event.currentOrderIndex;
    Event.currentOrderIndex ++;

    this.state.mutate(event);
    this.changes.push(event);

    this.callListeners(event);
  }

  protected generateId (): EntityId {
    return generate('1234567890qwertyuiopasdfghjklzxcvbnm', 30);
  }

  private callListeners (event: Event): void {
    if (this.listeners[event.type]) {
      for (let index in this.listeners[event.type]) {
        this.listeners[event.type][index](event);
      }
    }
  }
}

abstract class EntityState {
  public id: EntityId;

  // Не нужно делать конструктор с вызовом applyEvents.
  // Тогда дефолтные параметры стейта будут перетирать параметры
  // полученные в результате работы autoApplyEvent.

  public mutate (event: Event<any>): void {
    let methodName = 'when' + event.type;

    if ((this as any)[methodName]) {
      (this as any)[methodName](event);
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
        (this as any)[key] = data[key];
      }
    }
  }
}

export {Entity, EntityState, EntityId};
