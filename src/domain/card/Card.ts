import { Entity } from '../../infr/Entity';

const nanoid = require('nanoid');

import { Event } from '../../infr/Event';
import {
  CardAttackTargetSet, CardCreated, CardDied, CardTapped,
  CardTookDamage
} from './CardEvents';
import { CardState } from './CardState';

class Card extends Entity {
  protected state: CardState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new CardState(events);
  }

  get id () { return this.state.id; }
  get name () { return this.state.name; }
  get hp () { return this.state.hp; }
  get damage () { return this.state.damage; }
  get armor () { return this.state.armor; }
  get alive () { return this.state.alive; }
  get tapped () { return this.state.tapped; }

  public init (name: string, hp: number, damage: number, armor: number) {
    // тут может быть бизнес логика
    let id = nanoid();

    this.apply(new CardCreated(
      {id, name, hp, damage, armor, tapped: false, alive: true}
    ));
  }

  public setAttackTarget (defendingCard: Card) {
    if (this.tapped) {
      throw new Error('Tapped card cant attack.');
    }

    this.apply(new CardAttackTargetSet(
      {id: this.state.id, targetId: defendingCard.id})
    );
    this.apply(new CardTapped({id: this.state.id, tapped: true}));
  }

  public takeDamage (damage: number) {
    let newHp = this.state.hp - damage;

    this.apply(new CardTookDamage({id: this.state.id, hp: newHp}));

    if (newHp <= 0) {
      if (this.state.alive === false) {
        throw new Error('What Is Dead May Never Die.');
      }

      this.apply(new CardDied({id: this.state.id, alive: false}));
      // CardsOnTableUseCases.cardDied(this.state.id);
    }
  }
}

export {Card};
