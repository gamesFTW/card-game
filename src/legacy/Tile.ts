import {Card} from "../domain/card/Card";

class Tile {
  private cards: Array<Card> = [];

  constructor() {
  }

  public addCard(card: Card) {
    this.cards.push(card);
  }

  public checkCard(card: Card): boolean {
    return this.cards.indexOf(card) != -1;
  }
}

export {Tile};
