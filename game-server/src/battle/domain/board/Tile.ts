import { EntityId } from '../../infr/Entity';
import { DomainError } from '../../infr/DomainError';

class Tile {
  private cards: Array<EntityId> = [];

  public addCard (cardId: EntityId): void {
    this.cards.push(cardId);
  }

  public removeCard (cardId: EntityId): void {
    let cardIndex = this.cards.indexOf(cardId);
    if (cardIndex < 0) {
      throw new DomainError(`Not found card ${cardId} in tile.`);
    }
    this.cards.splice(cardIndex, 1);
  }

  public checkCard (cardId: EntityId): boolean {
    return this.cards.indexOf(cardId) !== -1;
  }
}

export {Tile};
