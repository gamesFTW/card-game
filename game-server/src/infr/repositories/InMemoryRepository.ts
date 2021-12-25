import { IRepository } from './Repository';
import { Entity, EntityId } from '../Entity';
import { Event } from '../Event';
import * as lodash from "lodash";

class InMemoryRepository implements IRepository {
  private cache: {[key: string]: any};

  constructor(cache: {[key: string]: any}) {
    this.cache = cache;
  }

  public async save (param: Entity | Array<Entity | Array<Entity>>): Promise<Array<Event>> {
    let entities = this.prepareEntities(param);

    for (let entity of entities) {
      this.cache[entity.id] = entity;
    }

    return []; // заглушка
  }

  public async get <EntityClass> (id: EntityId, ClassConstructor: any): Promise<EntityClass> {
    if (this.cache[id]) {
      return this.cache[id] as EntityClass;
    }
  }

  public async getMany <EntityClass> (entityIds: Array<EntityId>, ClassConstructor: any): Promise<Array<EntityClass>> {
    const entities = [];

    for (let entityId of entityIds) {
      if (this.cache[entityId]) {
        entities.push(this.cache[entityId] as EntityClass);
      }
    }

    return entities;
  }

  public getCache() {
    return this.cache;
  }

  private prepareEntities (param: Entity | Array<Entity | Array<Entity>>): Array<Entity> {
    let params = lodash.isArray(param) ? param : [param];
    return lodash.flatten(params);
  }
}

export { InMemoryRepository }
