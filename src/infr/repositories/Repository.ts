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

  static async get<T> (id: EntityId, ClassConstructor: any, eventsClasses: any): Promise<T> {
    let stream = await eventStore.getEventStream({
      aggregateId: id,
      aggregate: ClassConstructor.name
    });

    return Repository._createEntityByEvents(stream.events, ClassConstructor, eventsClasses);
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

  private static _createEntityByEvents (
      streamEvents: Array <eventstore.Event>, ClassConstructor: any, eventsClasses: any
  ) {
    let events: Array<Event> = streamEvents.map((eventstoreEvent: eventstore.Event) => {
      let payload = eventstoreEvent.payload;

      let AggregateEventClass: any = (eventsClasses as any)[payload.type];
      return new AggregateEventClass(payload.data);
    });

    return new ClassConstructor(events);
  }
}

export {Repository};
