import { map } from 'lodash';
import { Repository } from './repositories/Repository';
import { godOfSockets } from './GodOfSockets';
import { Entity, EntityId } from './Entity';
import { CardChanges } from '../app/player/AttackCardUseCase';

type Params = {
  gameId: EntityId;
}

abstract class UseCase<TParams extends Params = Params> {
  protected action: any;
  protected params: TParams;
  protected entities: any;
  protected repository: Repository;

  constructor (params: TParams) {
    this.params = params;
  }

  public static async executeSequentially (gameId: EntityId, useCases: UseCase[]): Promise<void> {
    const repository = new Repository(gameId);
    const actions = [];

    for (let useCase of useCases) {
      useCase.setRepository(repository);
      await useCase.execute(false);
      actions.push(useCase.getAction());
    }

    godOfSockets.sendActions(gameId, actions);
  }

  public async execute (sendActions: boolean = true): Promise<void> {
    if (!this.repository) {
      this.repository = new Repository(this.params.gameId);
    }

    await this.readEntities();
    this.addEventListeners();
    this.runBusinessLogic();
    this.addClientActions();
    await this.saveEntities();

    this.unsubscribeAllEventListeners();

    if (sendActions) {
      godOfSockets.sendActions(this.entities.game.id, [this.action]);
    }
  }

  public getAction (): any {
    return this.action;
  }

  public setRepository (repository: Repository): void {
    this.repository = repository;
  }

  protected abstract readEntities (): Promise<void>;

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
