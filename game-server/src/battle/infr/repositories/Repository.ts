import { Event } from '../Event';
import { Entity, EntityId } from '../Entity';
import * as lodash from 'lodash';
import { DevRepository } from './DevRepository';
import config from '../../../config';
import { Collection } from 'mongodb';
import { EventData, Game } from '../../../lobby/entities/Game';
import { ObjectId } from 'mongodb';

class Repository {
  static gamesCollection: Collection<Game>;
  // Да save умеет работать с массивом, а get не умеет. Я не поборол тайпскрипт.
  // Поэтому есть метод getMany.

  public static inMemoryCache: {[key: string]: Event[]} = {} as {[key: string]: any};

  public gameId: EntityId;

  private cache: {[key: string]: any} = {} as {[key: string]: any};

  public static clearInMemoryCache (): void {
    Repository.inMemoryCache = {};
  }

  constructor(gameId: EntityId) {
    this.gameId = gameId;
  }

  async save (param: Entity | Array<Entity | Array<Entity>>): Promise<Array<Event>> {
    let entities = this.prepareEntities(param);
    let events: Array<Event>;

    // TODO нужно помечать события как сохраненные и как запаблишиные.

    if (config.DEV) {
      events = await DevRepository.save(entities, this.gameId);
    } else {
      throw new Error('config.DEV == false is Not implemented now.');
      // events = await this.saveInternal(entities);
    }

    this.cache = {};

    // await this.dispatchEvents(events);
    return events;
  }

  async get <EntityClass> (entityId: EntityId, ClassConstructor: any): Promise<EntityClass> {
    if (this.cache[entityId]) {
      return this.cache[entityId] as EntityClass;
    }

    let entity;

    if (config.IN_MEMORY_STORAGE) {
      let events = Repository.inMemoryCache[entityId];

      entity = new ClassConstructor(events);
    } else {
      // let stream = null;
      // try {
      //   stream = await eventStore.getEventStream({
      //     aggregateId: id,
      //     aggregate: ClassConstructor.name
      //   });
      // } catch (error) {
      //   throw new Error(`Cant find id: ${id} while creating ${ClassConstructor.name}`);
      // }

      const result = await Repository.gamesCollection.findOne(
          { _id: new ObjectId(this.gameId) },
          { projection: { [`entities.${ClassConstructor.name}.${entityId}`]: 1 } }
      );

      const eventDataRecords = result?.entities?.[ClassConstructor.name]?.[entityId];
      const eventDatas = Object.values(eventDataRecords);

      entity = this.createEntityByEvents<EntityClass>(eventDatas, ClassConstructor);
    }

    this.cache[entityId] = entity;
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

  // private async saveInternal (entities: Array<Entity>, gameId: EntityId): Promise<Array<Event>> {
  //   let eventsArray = await Promise.all(entities.map((entity) => this.saveOne(entity, gameId)));
  //   return lodash.flatten(eventsArray);
  // }

  // private async saveOne (entity: Entity, gameId: EntityId): Promise<Array<Event>> {
  //   const events = entity.changes;

  //   for await (const event of events) {
  //     const eventId = new ObjectId();
  //     const updatePath = `entities.${entity.constructor.name}.${entity.id}.${eventId}`;
        
  //     const result = await Repository.gamesCollection.updateOne(
  //         { _id: gameId },
  //         { 
  //             $set: { 
  //                 [updatePath]: {
  //                   type: event.type,
  //                   data: event.data,
  //                   extra: event.extra,
  //                   id: eventId
  //                 } 
  //             } 
  //         }
  //     );
  //   }

  //   events.forEach(event => event.saved = true);

  //   return events;
  // }

  private createEntityByEvents<EntityClass> (eventDatas: Array <EventData>, ClassConstructor: any): EntityClass {
    let events = eventDatas.map((eventData) => {
      if (eventData.data === undefined) {
        return new Event<any>(eventData.type);
      } else if (eventData.extra === undefined) {
        return new Event<any>(eventData.type, eventData.data);
      } else {
        return new Event<any>(eventData.type, eventData.data, eventData.extra);
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

