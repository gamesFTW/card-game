import {Field} from "./Field";
import {Card} from "../domain/card/Card";
import {Point} from "./Point";

class Game {
  private field: Field;

  public constructor() {
    this.field = new Field(5, 5);

    // this.createCard("Orc", new Point(1, 1));
    // this.createCard("Elf", new Point(5, 5));
  }

  // public showAllCards(): void {
  //   this.state.cards.forEach(card => this.showCard(card));
  // }

  // private showCard(card: CardData): void {
  //   let point = this.state.field.getPointByCard(card);
  //   console.log(card.name, point.x, point.y);
  // }

  // private createCard(name: string, point: Point): CardData {
  //   let card = new CardData(name);
  //   // let tile = this.state.field.getTileByPoint(point);
  //   // tile.addCard(card);
  //   this.state.cards.push(card);
  //
  //   return card;
  // }
}

// class GameState {
//   public field: Field;
//   public cards: Array<CardData> = [];
//
//   public constructor(field: Field) {
//     this.field = field;
//   }
//
//   // onGameCreated(event: GameCreatedEvent) {
//   //
//   // }
//   //
//   // onCardCreated(event: CardCreatedEvent) {
//   //   // this.cards.push(event.card);
//   // }
// }

export {Game};
