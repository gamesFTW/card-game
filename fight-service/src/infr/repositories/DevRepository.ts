import { Event } from '../Event';
import { Entity } from '../Entity';
import { eventStore } from '../eventStore';
import * as lodash from 'lodash';
import config from '../../config';
import { Repository } from './Repository';

class DevRepository {
  static async save (entities: Array<Entity>): Promise<Array<Event>> {
    let eventsWithEntity: Array<{event: Event, entity: Entity}> = [];
    let events: Array<Event> = [];

    entities.forEach((entity: Entity) => {
      entity.changes.forEach((event: Event) => {
        eventsWithEntity.push({event: event, entity: entity});
        events.push(event);
      });
    });

    let orderedEventsWithEntity = lodash.sortBy(eventsWithEntity, (eventWithEntity) => {
      return eventWithEntity.event.orderIndex;
    });

    // Нужно для визуального разделения событий.
    await DevRepository.saveDebugEntry();
    for (let orderedEventWithEntity of orderedEventsWithEntity) {
      await DevRepository.saveOne(orderedEventWithEntity);
    }

    let orderedEvents = lodash.sortBy(events, 'orderIndex');

    return orderedEvents;
  }

  private static async saveOne (orderedEventWithEntity: {event: Event, entity: Entity}): Promise<void> {
    let {event, entity} = orderedEventWithEntity;

    if (config.IN_MEMORY_STORAGE) {
      if (!Repository.inMemoryCache[entity.id]) {
        Repository.inMemoryCache[entity.id] = [];
      }
      Repository.inMemoryCache[entity.id].push(event);
    } else {
      let stream = await eventStore.getEventStream({
        aggregateId: entity.id,
        aggregate: entity.constructor.name
      });

      stream.addEvent(event);

      await stream.commit();
    }
  }

  private static async saveDebugEntry (): Promise<void> {
    if (config.IN_MEMORY_STORAGE) {
      return;
    }

    let stream = await eventStore.getEventStream({
      aggregateId: 'DEBUG',
      aggregate: 'DEBUG'
    });

    stream.addEvent({});

    await stream.commit();
  }
}

export {DevRepository};
