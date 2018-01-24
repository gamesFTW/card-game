const nanoid = require('nanoid');

import {Event} from '../../infr/Event';
import {CardCreated, CardTookDamage} from "./CardEvents";
import {CardState} from "./CardState";

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

    this.apply(new CardTookDamage({id: this.state.id, hp: newHp}));

    // if (newHp <= 0) {
    //     this.apply(new CardDied());
    // }
  }

  private apply(event: Event) {
    this.state.mutate(event);
    this.changes.push(event);
  }

  //ловим ивент:
  //this.name = event.name
}

export {Card};
