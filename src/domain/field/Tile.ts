import { EntityId, EntityState } from "../../infr/Entity";

class Tile {
  private cards: Array<EntityId> = [];

  public addCard (cardId: EntityId) {
    this.cards.push(cardId);
  }

  public removeCard (cardId: EntityId) {
    let cardIndex = this.cards.indexOf(cardId);
    if (cardIndex < 0) {
      throw new Error(`Not found card ${cardId} in tile.`);
    }
    this.cards.splice(cardIndex, 1);
  }

  public checkCard (cardId: EntityId): boolean {
    return this.cards.indexOf(cardId) !== -1;
  }
}

export {Tile};
