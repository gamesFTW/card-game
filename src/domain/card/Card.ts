import {Entity} from "../../infr/Entity";

const nanoid = require('nanoid');

import {Event} from '../../infr/Event';
import {CardCreated, CardDied, CardTookDamage} from "./CardEvents";
import {CardState} from "./CardState";

class Card extends Entity {
  public state: CardState;

  constructor(events: Array<Event> = []) {
    super();
    this.state = new CardState(events);
  }

  public init(name: string, hp: number) {
    // тут может быть бизнес логика
    let id = nanoid();
    this.apply(new CardCreated({id, name, hp, alive: true}));
  }

  public takeDamage(damage: number) {
    let newHp = this.state.hp - damage;

    this.apply(new CardTookDamage({id: this.state.id, hp: newHp}));

    if (newHp <= 0) {
      if (this.state.alive == false) {
        throw new Error('What Is Dead May Never Die.');
      }

      this.apply(new CardDied({id: this.state.id, alive: false}));
      // CardsOnTableUseCases.cardDied(this.state.id);
    }
  }
}

export {Card};
