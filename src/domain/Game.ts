import {Field} from "./Field";
import {Card} from "./Card";
import {Point} from "./Point";

class Game {
  private state: GameState;

  public constructor() {
    let field = new Field(5, 5);
    this.state = new GameState(field);

    this.createCard("Orc", new Point(1, 1));
    this.createCard("Elf", new Point(5, 5));
  }

  public showAllCards(): void {
    this.state.cards.forEach(card => this.showCard(card));
  }

  private showCard(card: Card): void {
    let point = this.state.field.getPointByCard(card);
    console.log(card.name, point.x, point.y);
  }

  private createCard(name: string, point: Point): Card {
    let card = new Card(name);
    // let tile = this.state.field.getTileByPoint(point);
    // tile.addCard(card);

    return card;
  }
}

class GameState {
  public field: Field;
  public cards: Array<Card> = [];

  public constructor(field: Field) {
    this.field = field;
  }

  onCardCreated(event: CardCreatedEvent) {
    this.cards.push(event.card);
  }
}

export {Game};
