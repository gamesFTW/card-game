import { Entity, EntityId } from '../../infr/Entity';

import { Event } from '../../infr/Event';
import { Abilities, CardData, CardState } from './CardState';
import { CardEventType, CardMovedExtra } from '../events';
import * as lodash from 'lodash';
import { Point } from '../../infr/Point';

interface CardCreationData {
  name: string;
  maxHp: number;
  damage: number;
  manaCost: number;
  abilities?: Abilities;
}

class Card extends Entity {
  private static DEFAULT_MOVING_POINTS: number = 3;

  protected state: CardState;

  get hero (): boolean { return this.state.hero; }
  get name (): string { return this.state.name; }
  get currentHp (): number { return this.state.currentHp; }
  get maxHp (): number { return this.state.maxHp; }
  get damage (): number { return this.state.damage; }
  get alive (): boolean { return this.state.alive; }
  get tapped (): boolean { return this.state.tapped; }
  get manaCost (): number { return this.state.manaCost; }

  // Deprecared. Надо выпилить.
  get armor (): number {
    if (this.state.abilities.armored) {
      return this.state.abilities.armored.armor;
    }
    return 0;
  }

  get abilities (): Abilities { return this.state.abilities; }

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
        CardEventType.CARD_TAPPED,
        {tapped: true, id: this.state.id, currentMovingPoints: 0}
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
      this.addDefaultMovingPoints();
    }

    if (this.tapped) {
      this.untap();
    }
  }

  // Нужно вызвать в начале игры, если карта лежит на столе при старте игры.
  public prepareAtStartOfGame (): void {
    this.makeAlive();
    this.addDefaultMovingPoints();
  }

  public move (movingPoints: number, path: Point[]): void {
    if (movingPoints > this.state.currentMovingPoints) {
      throw new Error(`Card ${this.state.id} dont have moving points`);
    }

    let currentMovingPoints = this.state.currentMovingPoints - movingPoints;

    this.applyEvent(new Event<CardData, CardMovedExtra>(
      CardEventType.CARD_MOVED,
      {currentMovingPoints, id: this.state.id},
      {path}
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
        CardEventType.CARD_TOOK_DAMAGE, {currentHp: newHp, id: this.state.id}
      ));

    if (newHp <= 0) {
      this.killCard();
    }
  }

  public heal (heal: number): void {
    let newHp = this.state.currentHp + heal;

    newHp = newHp <= this.state.maxHp ? newHp : this.state.maxHp;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_HEALED, {currentHp: newHp, id: this.state.id}
    ));
  }

  public overheal (heal: number): void {
    let newHp = this.state.currentHp + heal;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_HEALED, {currentHp: newHp, id: this.state.id}
    ));
  }

  public makeAlive (): void {
    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_PLAYED, {alive: true, currentMovingPoints: 0, currentHp: this.maxHp, id: this.state.id}
    ));
  }

  public blockRangeAbility (): void {
    let abilities = lodash.cloneDeep(this.state.abilities);
    abilities.range.blockedInBeginningOfTurn = true;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_BLOCKED_RANGE_ABILITY,
      {id: this.id, abilities}
    ));
  }

  public unblockRangeAbility (): void {
    let abilities = lodash.cloneDeep(this.state.abilities);
    abilities.range.blockedInBeginningOfTurn = false;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_UNBLOCKED_RANGE_ABILITY,
      {id: this.id, abilities}
    ));
  }

  private addDefaultMovingPoints (): void {
    let movingPoints;

    if (this.abilities.speed) {
      movingPoints = this.abilities.speed.speed;
    } else {
      movingPoints = Card.DEFAULT_MOVING_POINTS;
    }

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_ADDED_CURRENT_MOVING_POINTS,
      {currentMovingPoints: movingPoints, id: this.state.id}
    ));
  }

  private killCard (): void {
    if (this.state.alive === false) {
      throw new Error('What Is Dead May Never Die.');
    }

    if (this.tapped) {
      this.untap();
    }

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_DIED, {alive: false, id: this.state.id})
    );
  }
}

export {Card, CardCreationData};
