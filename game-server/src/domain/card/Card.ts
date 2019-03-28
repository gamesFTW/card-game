import { Entity, EntityId } from '../../infr/Entity';

import { Event } from '../../infr/Event';
import { AnyAbility, CardData, CardState } from './CardState';
import { CardEventType } from '../events';

interface CardCreationData {
  name: string;
  maxHp: number;
  damage: number;
  manaCost: number;
  movingPoints: number;
  abilities?: {[abilityName: string]: AnyAbility};
}

class Card extends Entity {
  protected state: CardState;

  get name (): string { return this.state.name; }
  get maxHp (): number { return this.state.maxHp; }
  get damage (): number { return this.state.damage; }
  get alive (): boolean { return this.state.alive; }
  get tapped (): boolean { return this.state.tapped; }
  get manaCost (): number { return this.state.manaCost; }

  get abilities (): {[abilityName: string]: AnyAbility} { return this.state.abilities; }

  constructor (events: Array<Event<CardData>> = []) {
    super();
    this.state = new CardState(events);
  }

  public create (cardCreationData: CardCreationData): void {
    let id = this.generateId();

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_CREATED, {id, abilities: {}, ...cardCreationData}
    ));
  }

  public tap (): void {
    if (this.state.tapped) {
      throw new Error(`Card ${this.id} already tapped`);
    } else {
      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_TAPPED, {tapped: true, id: this.state.id}
      ));
    }
  }

  public untap (): void {
    if (this.state.tapped) {
      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_UNTAPPED, {tapped: false, id: this.state.id}
      ));
    } else {
      throw new Error(`Card ${this.id} already untapped`);
    }
  }

  public onEndOfTurn (): void {
    if (this.state.alive) {

      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_ADDED_CURRENT_MOVING_POINTS,
        {currentMovingPoints: this.state.movingPoints}
      ));
    }

    if (this.tapped) {
      this.untap();
    }
  }

  public play (): void {
    this.makeAlive();
    this.tap();
  }

  public move (movingPoints: number): void {
    if (movingPoints > this.state.currentMovingPoints) {
      throw new Error(`Card ${this.state.id} dont have moving points`);
    }

    let newCurrentMovingPoints = this.state.currentMovingPoints - movingPoints;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_MOVED,
      {currentMovingPoints: newCurrentMovingPoints}
    ));
  }

  // public setAttackTarget (defendingCard: CardData) {
  //   if (this.tapped) {
  //     throw new Error('Tapped card cant attack.');
  //   }
  //
  //   this.apply(new CardAttackTargetSet(
  //     {id: this.state.id, targetId: defendingCard.id})
  //   );
  //   this.apply(new CardTapped({id: this.state.id, tapped: true}));
  // }

  public takeDamage (damage: number): void {
    let newHp = this.state.currentHp - damage;

    this.applyEvent(new Event<CardData>(
        CardEventType.CARD_TOOK_DAMAGE, {currentHp: newHp}
      ));

    if (newHp <= 0) {
      if (this.state.alive === false) {
        throw new Error('What Is Dead May Never Die.');
      }

      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_DIED, {alive: false})
      );
    }
  }

  private makeAlive (): void {
    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_PLAYED, {alive: true, currentMovingPoints: 0, currentHp: this.maxHp}
    ));
  }
}

export {Card, CardCreationData};
