import { Entity, EntityId } from '../../infr/Entity';

import { Event } from '../../infr/Event';
import { CardData, CardState } from './CardState';
import { CardEventType } from '../events';

interface CardCreationData {
  name: string;
  maxHp: number;
  damage: number;
  mannaCost: number;
}

class Card extends Entity {
  protected state: CardState;

  get name (): string { return this.state.name; }
  get maxHp (): number { return this.state.maxHp; }
  get damage (): number { return this.state.damage; }
  get alive (): boolean { return this.state.alive; }
  get tapped (): boolean { return this.state.tapped; }
  get mannaCost (): number { return this.state.mannaCost; }

  constructor (events: Array<Event<CardData>> = []) {
    super();
    this.state = new CardState(events);
  }

  public create (cardCreationData: CardCreationData): void {
    let id = this.generateId();

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_CREATED, {id, ...cardCreationData}
    ));
  }

  public tap (): void {
    if (this.state.tapped) {
      throw new Error(`Card ${this.id} already tapped`);
    } else {
      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_TAPPED, {id: this.id, tapped: true}
      ));
    }
  }

  public untap (): void {
    if (this.state.tapped) {
      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_UNTAPPED, {id: this.id, tapped: false}
      ));
    } else {
      throw new Error(`Card ${this.id} already untapped`);
    }
  }

  // public setAttackTarget (defendingCard: Card) {
  //   if (this.tapped) {
  //     throw new Error('Tapped card cant attack.');
  //   }
  //
  //   this.apply(new CardAttackTargetSet(
  //     {id: this.state.id, targetId: defendingCard.id})
  //   );
  //   this.apply(new CardTapped({id: this.state.id, tapped: true}));
  // }

  // public takeDamage (damage: number) {
  //   let newHp = this.state.hp - damage;
  //
  //   this.apply(new CardTookDamage({id: this.state.id, hp: newHp}));
  //
  //   if (newHp <= 0) {
  //     if (this.state.alive === false) {
  //       throw new Error('What Is Dead May Never Die.');
  //     }
  //
  //     this.apply(new CardDied({id: this.state.id, alive: false}));
  //     // CardsOnTableUseCases.cardDied(this.state.id);
  //   }
  // }
}

export {Card, CardCreationData};
