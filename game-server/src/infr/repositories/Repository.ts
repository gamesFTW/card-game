import { Event } from '../Event';
import { Entity, EntityId } from '../Entity';
import { eventStore } from '../eventStore';
import * as eventstore from 'eventstore';
import * as lodash from 'lodash';
import { DevRepository } from './DevRepository';
import config from '../../config';
import { mq } from '../mq/mq';

class Repository {
  // Да save умеет работать с массивом, а get не умеет. Я не поборол тайпскрипт.
  // Поэтому есть метод getMany.

  private cache: {[key: string]: any} = {} as {[key: string]: any};

  async save (param: Entity | Array<Entity | Array<Entity>>): Promise<Array<Event>> {
    let entities = this.prepareEntities(param);
    let events: Array<Event>;

    // TODO нужно помечать события как сохраненные и как запаблишиные.

    if (config.DEV) {
      events = await DevRepository.save(entities);
    } else {
      events = await this.saveInternal(entities);
    }

    this.cache = {};

    await this.dispatchEvents(events);
    return events;
  }

  async get <EntityClass> (id: EntityId, ClassConstructor: any): Promise<EntityClass> {
    if (this.cache[id]) {
      return this.cache[id] as EntityClass;
    }

    let stream = null;

    try {
      stream = await eventStore.getEventStream({
        aggregateId: id,
        aggregate: ClassConstructor.name
      });
    } catch (error) {
      throw new Error(`Cant find id: ${id} while creating ${ClassConstructor.name}`);
    }

    let entity = this.createEntityByEvents<EntityClass>(stream.events, ClassConstructor);
    this.cache[id] = entity;
    return entity;
  }

  async getMany <EntityClass> (entityIds: Array<EntityId>, ClassConstructor: any):
    Promise<Array<EntityClass>> {
    return await Promise.all(entityIds.map(entityId => {
      return this.get(entityId, ClassConstructor);
    })) as Array<EntityClass>;
  }

  // Приватность означает, что эти методы может вызывать только Repository.
  private prepareEntities (param: Entity | Array<Entity | Array<Entity>>): Array<Entity> {
    let params = lodash.isArray(param) ? param : [param];
    return lodash.flatten(params);
  }

  private async saveInternal (entities: Array<Entity>): Promise<Array<Event>> {
    let eventsArray = await Promise.all(entities.map(this.saveOne));
    return lodash.flatten(eventsArray);
  }

  private async dispatchEvents (events: Array<Event>): Promise<void> {
    events.forEach((event: Event) => mq.publish(event));
  }

  private async saveOne (entity: Entity): Promise<Array<Event>> {
    let stream = await eventStore.getEventStream({
      aggregateId: entity.id,
      aggregate: entity.constructor.name
    });

    let events = entity.changes;

    events.forEach((event: Event) => {
      stream.addEvent(event);
    });

    await stream.commit();

    events.forEach(event => event.saved = true);

    return events;
  }

  private createEntityByEvents<EntityClass> (
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

  // static async getAll (): Promise<Array<CardData>> {
  //   let events = await eventStore.getEvents({
  //     aggregate: CardData.name
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
