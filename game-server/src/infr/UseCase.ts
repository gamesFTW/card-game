import { map } from 'lodash';
import { IRepository, Repository } from './repositories/Repository';
import { godOfSockets } from './GodOfSockets';
import { Entity, EntityId } from './Entity';
import { CardChanges } from '../app/player/AttackCardUseCase';

type LifecycleMethods = {
  isReadEntities?: boolean,
  isAddEventListeners?: boolean,
  isRunBusinessLogic?: boolean,
  isAddClientActions?: boolean,
  isSaveEntities?: boolean,
  isUnsubscribeAllEventListeners?: boolean,
  isSendActions?: boolean
}

abstract class UseCase<Params> {
  protected action: any;
  protected params: Params;
  protected entities: any;
  protected repository: IRepository;

  private readonly lifecycleMethods: LifecycleMethods = {
    isReadEntities: true,
    isAddEventListeners: true,
    isRunBusinessLogic: true,
    isAddClientActions: true,
    isSaveEntities: true,
    isUnsubscribeAllEventListeners: true,
    isSendActions: true
  };

  constructor (params: Params, repository: IRepository = null, lifecycleMethods: LifecycleMethods = null) {
    this.params = params;
    
    if (lifecycleMethods) {
      this.lifecycleMethods = { ...this.lifecycleMethods, ...lifecycleMethods};
    }

    if (repository) {
      this.repository = repository;
    } else {
      this.repository = new Repository();
    }
  }

  public static async executeSequentially (gameId: EntityId, useCases: UseCase<any>[]): Promise<void> {
    const repository = new Repository();
    const actions = [];

    for (let useCase of useCases) {
      useCase.setRepository(repository);
      await useCase.execute();
      actions.push(useCase.getAction());
    }

    godOfSockets.sendActions(gameId, actions);
  }

  public async execute (): Promise<void> {
    if (this.lifecycleMethods.isReadEntities) {
      await this.readEntities();
    }

    if (this.lifecycleMethods.isAddEventListeners) {
      this.addEventListeners();
    }

    if (this.lifecycleMethods.isRunBusinessLogic) {
      this.runBusinessLogic();
    }

    if (this.lifecycleMethods.isAddClientActions) {
      this.addClientActions();
    }

    if (this.lifecycleMethods.isSaveEntities) {
      await this.saveEntities();
    }

    if (this.lifecycleMethods.isUnsubscribeAllEventListeners) {
      this.unsubscribeAllEventListeners();
    }

    if (this.lifecycleMethods.isSendActions) {
      godOfSockets.sendActions(this.entities.game.id, [this.action]);
    }
  }

  public getAction (): any {
    return this.action;
  }

  public setRepository (repository: IRepository): void {
    this.repository = repository;
  }

  protected abstract readEntities (): void;

  protected abstract addEventListeners (): void;

  protected abstract runBusinessLogic (): void;

  protected abstract addClientActions (): void;

  protected getOrCreateCardChangesById (cardId: EntityId): CardChanges {
    let cardChanges = null;
    for (let card of this.action.cardChanges) {
      if (card.id === cardId) {
        cardChanges = card;
      }
    }

    if (!cardChanges) {
      cardChanges = {id: cardId};
      this.action.cardChanges.push(cardChanges);
    }

    return cardChanges;
  }

  private async saveEntities (): Promise<void> {
    let entities = map(this.entities, (e: Entity) => e);
    await this.repository.save(entities);
  }

  private unsubscribeAllEventListeners (): void {
    for (let key in this.entities) {
      let entityOrEntities = this.entities[key];
      if (Array.isArray(entityOrEntities)) {
        let entities = entityOrEntities as Entity[];
        for (let entity of entities) {
          entity.removeAllEventListeners();
        }
      } else {
        let entity: Entity = entityOrEntities;
        entity.removeAllEventListeners();
      }
    }
  }
}

export {UseCase};
