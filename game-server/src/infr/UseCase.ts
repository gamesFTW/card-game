import { map } from 'lodash';
import { Repository } from './repositories/Repository';
import { godOfSockets } from './GodOfSockets';
import { Entity } from './Entity';

abstract class UseCase {
  protected params: any;
  protected action: any;
  protected entities: any;

  public async execute (params: any): Promise<void> {
    this.params = params;

    await this.readEntities();
    this.addEventListeners();
    this.runBusinessLogic();
    this.addClientActions();
    await this.saveEntities();

    godOfSockets.sendActions(this.entities.game.id, [this.action]);
  }

  protected abstract async readEntities (): Promise<void>;

  protected abstract addEventListeners (): void;

  protected abstract runBusinessLogic (): void;

  protected abstract addClientActions (): void;

  private async saveEntities (): Promise<void> {
    let entities = map(this.entities, (e: Entity) => e);
    await Repository.save(entities);
  }
}

export {UseCase};
