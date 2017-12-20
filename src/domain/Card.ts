
class Card {
  get name(): string {return this.state.name};

  private state: CardState;

  constructor(name: string) {
    this.state = new CardState();

    this.dispatchEvent(CardCreatedEvent(name));
  }

  //ловим ивент:
  //this.name = event.name
}

class CardState {
  public name: string;

  public constructor() {

  }

  onCardCreated(event: CardCreatedEvent) {
    this.name = event.name;
  }
}

export {Card};
