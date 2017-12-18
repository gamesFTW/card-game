import {Field} from "./Field";
import {Card} from "./Card";
import {Point} from "./Point";

class Game {
  private field: Field;
  private cards: Array<Card> = [];

  public constructor() {
    this.field = new Field(5, 5);

    this.createCard("Orc", new Point(1, 1));
    this.createCard("Elf", new Point(5, 5));
  }

  public showAllCards(): void {
    this.cards.forEach(card => this.showCard(card));
  }

  private showCard(card: Card): void {
    let point = this.field.getPointByCard(card);
    console.log(card.name, point.x, point.y);
  }

  private createCard(name: string, point: Point): Card {
    let card = new Card(name);
    let tile = this.field.getTileByPoint(point);
    tile.addCard(card);

    this.cards.push(card);
    return card;
  }
}

export {Game};
