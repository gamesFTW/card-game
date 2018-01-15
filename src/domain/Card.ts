const nanoid = require('nanoid');

class Card {
  get name(): string {return this.state.name};

  public changes: Array<Event> = [];
  public state: CardState;

  constructor(events: Array<Event>) {
    this.state = new CardState(events);
  }

  public init(name: string) {
    // тут может быть бизнес логика
    this.apply(new CardCreatedEvent(nanoid(), name));
  }

  private apply(event: Event) {
    this.state.mutate(event);
    this.changes.push(event);
  }

  //ловим ивент:
  //this.name = event.name
}

class CardState {
  public name: string;
  public id: string;

  public constructor(events: Array<Event>) {
    events.forEach(event => this.mutate(event));
  }

  public mutate(event: Event) {
    if (event instanceof CardCreatedEvent) {
      this.whenCardCreated(event as CardCreatedEvent);
    }
  }

  whenCardCreated(event: CardCreatedEvent) {
    this.name = event.cardName;
    this.id = event.id;
  }
}


class Event {}

class CardCreatedEvent extends Event {
  public cardName: string;
  public id: string;
  public name: string = 'CardCreatedEvent';

  public constructor(id: string, cardName: string) {
    super();

    this.id = id;
    this.cardName = cardName;
  }
}


export {Card, Event};