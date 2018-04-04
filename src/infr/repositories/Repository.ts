import { Event } from '../Event';
import { Entity, EntityId } from '../Entity';
import { eventStore } from '../eventStore';
import * as eventstore from 'eventstore';
import * as lodash from 'lodash';

class Repository {
  static async save (entity: Entity): Promise<void> {
    let stream = await eventStore.getEventStream({
      aggregateId: entity.id,
      aggregate: entity.constructor.name
    });

    entity.changes.forEach((event: Event) => {
      stream.addEvent(event);
    });

    await stream.commit();
  }

  static async get (id: EntityId, ClassConstructor: any, eventsClasses: any): Promise<Entity> {
    let stream = await eventStore.getEventStream({
      aggregateId: id,
      aggregate: ClassConstructor.name
    });

    return Repository._createCardByEvents(stream.events, ClassConstructor, eventsClasses);
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
  //     result.push(PlayerRepository._createCardByEvents(events));
  //     return result;
  //   }, []);
  // }

  private static _createCardByEvents (
      streamEvents: Array <eventstore.Event>, ClassConstructor: any, eventsClasses: any
  ) {
    let events: Array<Event> = streamEvents.map((event: eventstore.Event) => {
      let payload = event.payload;

      let AggregateEventClass: any = (eventsClasses as any)[payload.type];
      return new AggregateEventClass(payload.data);
    });

    return new ClassConstructor(events);
  }
}

export {Repository};
