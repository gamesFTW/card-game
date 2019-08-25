import { map } from 'lodash';
import { Repository } from './repositories/Repository';
import { godOfSockets } from './GodOfSockets';
import { Entity, EntityId } from './Entity';
import { CardChanges } from '../app/player/AttackCardUseCase';

abstract class UseCase {
  protected params: any;
  protected action: any;
  protected entities: any;
  protected repository: Repository;

  public async execute (params: any): Promise<void> {
    this.params = params;

    this.repository = new Repository();

    await this.readEntities();
    this.addEventListeners();
    this.runBusinessLogic();
    this.addClientActions();
    await this.saveEntities();

    this.unsubscribeAllEventListeners();

    // console.log(this.action);

    godOfSockets.sendActions(this.entities.game.id, [this.action]);

  }

  protected abstract async readEntities (): Promise<void>;

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
