import { Event } from '../Event';
import { Entity } from '../Entity';
import { eventStore } from '../eventStore';
import * as lodash from 'lodash';

class DevRepository {
  static async save (entities: Array<Entity>): Promise<void> {
    let eventsWithEntity: Array<{event: Event, entity: Entity}> = [];
    entities.forEach((entity: Entity) => {
      entity.changes.forEach((event: Event) => {
        eventsWithEntity.push({event: event, entity: entity});
      });
    });

    let orderedEventsWithEntity = lodash.sortBy(eventsWithEntity, (eventWithEntity) => {
      return eventWithEntity.event.orderIndex;
    });

    await DevRepository.saveDebugEntry();
    for (let orderedEventWithEntity of orderedEventsWithEntity) {
      await DevRepository.saveOne(orderedEventWithEntity);
    }
  }

  private static async saveOne (orderedEventWithEntity: {event: Event, entity: Entity}): Promise<void> {
    let {event, entity} = orderedEventWithEntity;
    let stream = await eventStore.getEventStream({
      aggregateId: entity.id,
      aggregate: entity.constructor.name
    });

    stream.addEvent(event);

    await stream.commit();
  }

  private static async saveDebugEntry (): Promise<void> {
    let stream = await eventStore.getEventStream({
      aggregateId: 'DEBUG',
      aggregate: 'DEBUG'
    });

    stream.addEvent({});

    await stream.commit();
  }
}

export {DevRepository};
