import * as lodash from 'lodash';

import { Entity } from './Entity';
import config from '../config';

class Event<DataType = any, ExtraType = any> {
  public static currentOrderIndex = 0;

  public type: string;
  public data?: DataType;
  public extra?: ExtraType;
  // orderIndex нужен для воссоздания последовательности событий.
  // Работает только в рамках одного экшна контроллера!
  // Может показаться, что это костыль, но это не так.
  // Просто не стоит задачи сделать ордер между разными экшнами.
  public orderIndex: number;
  public saved: Boolean = false;

  public constructor (type: string, data?: DataType, extra?: ExtraType) {
    this.type = type;

    if (data) {
      this.data = data;
    }

    if (extra) {
      this.extra = extra;
    }

    if (config.DEV) {
      this.orderIndex = Event.currentOrderIndex;
      Event.currentOrderIndex ++;
    }
  }
}

let formatEventsForClient = (param: Array<Entity | Array<Entity>>): Array<Event> => {
  let params = lodash.isArray(param) ? param : [param];

  let entities: Array<Entity> = lodash.flatten(param);

  let events = entities.map((entity) => {
    return entity.changes;
  });

  return lodash.flatten(events);
};

export {Event, formatEventsForClient};
