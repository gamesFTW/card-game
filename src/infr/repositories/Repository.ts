import { Event } from '../Event';
import { Entity, EntityId } from '../Entity';
import { eventStore } from '../eventStore';
import * as eventstore from 'eventstore';
import * as lodash from 'lodash';

class Repository {
  static async save (param: Entity | Array<Entity>): Promise<void> {
    let entities = lodash.isArray(param) ? param : [param];

    await Promise.all(entities.map(async (entity: Entity) => {
      let stream = await eventStore.getEventStream({
        aggregateId: entity.id,
        aggregate: entity.constructor.name
      });

      entity.changes.forEach((event: Event<any>) => {
        stream.addEvent(event);
      });

      await stream.commit();
    }));
  }

  static async get<EntityClass> (id: EntityId, ClassConstructor: any): Promise<EntityClass> {
    let stream = await eventStore.getEventStream({
      aggregateId: id,
      aggregate: ClassConstructor.name
    });

    return Repository._createEntityByEvents<EntityClass>(stream.events, ClassConstructor);
  }

  private static _createEntityByEvents<EntityClass> (
      streamEvents: Array <eventstore.Event>, ClassConstructor: any
  ): EntityClass {
    let events = streamEvents.map((eventstoreEvent: eventstore.Event) => {
      let payload = eventstoreEvent.payload;

      if (payload.data === undefined) {
        return new Event<any>(payload.type);
      } else if (payload.extra === undefined) {
        return new Event<any>(payload.type, payload.data);
      } else {
        return new Event<any>(payload.type, payload.data, payload.extra);
      }
    });

    return new ClassConstructor(events);
  }

  // static async getAll (): Promise<Array<Card>> {
  //   let events = await eventStore.getEvents({
  //     aggregate: Card.name
  //   });
  //
  //   let groupedEvents = lodash.groupBy(events, 'aggregateId');
  //
  //   let sortedGroupedEvents = lodash.map(groupedEvents, (events) => {
  //     return lodash.sortBy(events,'commitStamp');
  //   });
  //
  //   return lodash.reduce(sortedGroupedEvents, (result, events: Array<eventstore.Event>) => {
  //     result.push(PlayerRepository._createEntityByEvents(events));
  //     return result;
  //   }, []);
  // }
}

export {Repository};
