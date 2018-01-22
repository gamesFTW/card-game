import {Event, CardCreated, CardTookDamage} from "./CardEvents";

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
    this.apply(new CardCreated({id, name, hp}));
  }

  public takeDamage(damage: number) {
    let newHp = this.state.hp - damage;

    //проверка на дай

    this.apply(new CardTookDamage({id: this.state.id, hp: newHp}));
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
    // console.log(event);
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

export {Card};
