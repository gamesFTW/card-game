import { Event } from '../Event';
import { Entity, EntityId } from '../Entity';
import { eventStore } from '../eventStore';
import * as eventstore from 'eventstore';
import * as lodash from 'lodash';

class Repository {
  // Да save умеет работать с массивом, а get не умеет. Я не поборол тайпскрипт.
  // Поэтому есть метод getMany.

  static async save (param: Entity | Array<Entity>): Promise<void> {
    // TODO: попробовать сделать так, чтобы в конце контроллера надо было вызывать всегда
    // только одино сохранение репозитория, которое сохраняет все события в порядке их возникновения.

    let entities = lodash.isArray(param) ? param : [param];

    await Promise.all(entities.map(Repository.saveOne));
  }

  static async get <EntityClass> (id: EntityId, ClassConstructor: any): Promise<EntityClass> {
    let stream = null;

    try {
      stream = await eventStore.getEventStream({
        aggregateId: id,
        aggregate: ClassConstructor.name
      });
    } catch (error) {
      throw new Error(`Cant find id: ${id} while creating ${ClassConstructor.name}`);
    }

    return Repository.createEntityByEvents<EntityClass>(stream.events, ClassConstructor);
  }

  static async getMany <EntityClass> (entityIds: Array<EntityId>, ClassConstructor: any):
    Promise<Array<EntityClass>> {
    return await Promise.all(entityIds.map(entityId => {
      return Repository.get(entityId, ClassConstructor);
    })) as Array<EntityClass>;
  }

  private static async saveOne (entity: Entity): Promise<void> {
    let stream = await eventStore.getEventStream({
      aggregateId: entity.id,
      aggregate: entity.constructor.name
    });

    entity.changes.forEach((event: Event<any>) => {
      stream.addEvent(event);
    });

    await stream.commit();
  }

  private static createEntityByEvents<EntityClass> (
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
