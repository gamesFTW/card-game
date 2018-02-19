import { EntityId, EntityState } from "../../infr/Entity";

class Tile {
  private cards: Array<EntityId> = [];

  public addCard (cardId: EntityId) {
    this.cards.push(cardId);
  }

  public checkCard (cardId: EntityId): boolean {
    return this.cards.indexOf(cardId) !== -1;
  }
}

export {Tile};
