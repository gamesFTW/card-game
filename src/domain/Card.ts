const nanoid = require('nanoid');

class Card {
  public changes: Array<Event> = [];
  public state: CardState;

  constructor(events: Array<Event>) {
    this.state = new CardState(events);
  }

  public init(name: string, hp: number) {
    // тут может быть бизнес логика
    let id = nanoid();
    this.apply(new CardCreated(id, name, hp));
  }

  public takeDamage(damage: number) {
    let newHp = this.state.hp - damage;

    //проверка на дай

    this.apply(new CardTookDamage(this.state.id, newHp));
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
  public hp: number;

  public constructor(events: Array<Event>) {
    events.forEach(event => this.mutate(event));
  }

  public mutate(event: Event) {
    if (event instanceof CardCreated) {
      this.whenCardCreated(event as CardCreated);
    }
    if (event instanceof CardTookDamage) {
      this.whenCardTookDamage(event as CardTookDamage);
    }
  }

  whenCardCreated(event: CardCreated) {
    this.id = event.data.id;
    this.name = event.data.name;
    this.hp = event.data.hp;
  }

  whenCardTookDamage(event: CardTookDamage) {
    this.hp = event.data.hp;
  }
}


class Event {
  public type: string;
  public data: EventData;

  public constructor() {
  }
}

interface EventData {
  id: string;
}


class CardCreated extends Event {
  public type: string = 'CardCreatedEvent';

  public data: CardCreatedData;

  public constructor(id: string, name: string, hp: number) {
    super();

    this.data = {id: id, name: name, hp: hp};
  }
}

interface CardCreatedData extends EventData {
  name: string;
  hp: number;
}


class CardTookDamage extends Event {
  public type: string = 'CardTookDamage';

  public data: CardTookDamageData;

  public constructor(id: string, hp: number) {
    super();

    this.data = {id: id, hp: hp};
  }
}

interface CardTookDamageData extends EventData {
  hp: number;
}


export {Card, Event};
