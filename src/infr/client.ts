import * as lodash from 'lodash';

import { Entity } from './Entity';
import { Event, ClientEvent } from './Event';

let formatEventsForClient = (param:Array<Entity | Array<Entity>>): Array<ClientEvent> => {
  let params = lodash.isArray(param) ? param : [param];

  let entities: Array<Entity> = lodash.flatten(param);

  let events =  entities.map((entity) => {
    return entity.changes.map((event: Event<any>) => {
      return ClientEvent.convertFromEvent(event, entity);
    });
  });

  return lodash.flatten(events);
}

export { formatEventsForClient };