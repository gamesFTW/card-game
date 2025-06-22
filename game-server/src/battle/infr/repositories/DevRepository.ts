import { Event } from '../Event';
import { Entity, EntityId } from '../Entity';
import * as lodash from 'lodash';
import config from '../../../config';
import { Repository } from './Repository';
import { Collection, ObjectId } from 'mongodb';
import { Game } from '../../../lobby/entities/Game';

class DevRepository {
  static gamesCollection: Collection<Game>;

  static async save (entities: Array<Entity>, gameId: EntityId): Promise<Array<Event>> {
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
    // await DevRepository.saveDebugEntry();
    for (let orderedEventWithEntity of orderedEventsWithEntity) {
      await DevRepository.saveOne(orderedEventWithEntity, gameId);
    }

    let orderedEvents = lodash.sortBy(events, 'orderIndex');

    return orderedEvents;
  }

  private static async saveOne (orderedEventWithEntity: {event: Event, entity: Entity}, gameId: EntityId): Promise<void> {
    let {event, entity} = orderedEventWithEntity;

    if (config.IN_MEMORY_STORAGE) {
      if (!Repository.inMemoryCache[entity.id]) {
        Repository.inMemoryCache[entity.id] = [];
      }
      Repository.inMemoryCache[entity.id].push(event);
    } else {
      const eventId = new ObjectId();
      const updatePath = `entities.${entity.constructor.name}.${entity.id}.${eventId}`;

      await Repository.gamesCollection.updateOne(
          { _id: new ObjectId(gameId) },
          { 
              $set: { 
                  [updatePath]: {
                    type: event.type,
                    data: event.data,
                    extra: event.extra,
                    id: eventId
                  } 
              } 
          }
      );
    }
  }

  // private static async saveDebugEntry (): Promise<void> {
  //   if (config.IN_MEMORY_STORAGE) {
  //     return;
  //   }

  //   let stream = await eventStore.getEventStream({
  //     aggregateId: 'DEBUG',
  //     aggregate: 'DEBUG'
  //   });

  //   stream.addEvent({});

  //   await stream.commit();
  // }
}

export {DevRepository};
