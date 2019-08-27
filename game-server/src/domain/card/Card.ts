import { Entity, EntityId } from '../../infr/Entity';

import { Event } from '../../infr/Event';
import { Abilities, CardData, CardState, NegativeEffects } from './CardState';
import { CardEventType, CardMovedExtra } from '../events';
import * as lodash from 'lodash';
import { Point } from '../../infr/Point';
import { DomainError } from '../../infr/DomainError';

interface CardCreationData {
  hero: boolean;
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
  get negativeEffects (): NegativeEffects { return this.state.negativeEffects; }

  constructor (events: Array<Event<CardData>> = []) {
    super();
    this.state = new CardState(events);
  }

  public create (cardCreationData: CardCreationData): void {
    let id = this.generateId();

    if (cardCreationData.abilities.evasion) {
      cardCreationData.abilities.evasion = {
        usedInThisTurn: false
      };
    }

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_CREATED, {
        id,
        abilities: {},
        negativeEffects: {},
        initialDamage: cardCreationData.damage,
        ...cardCreationData}
    ));
  }

  public tap (): void {
    if (this.state.tapped) {
      throw new DomainError(`Card ${this.id} already tapped`);
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
      throw new DomainError(`Card ${this.id} already untapped`);
    }
  }

  public onEndOfTurn (): void {
    if (this.state.alive) {
      this.addDefaultMovingPoints();

      this.resetAbilities();
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
      throw new DomainError(`Card ${this.state.id} doesn't have moving points`);
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
  //     throw new DomainError('Tapped card cant attack.');
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

  public block (): void {
    if (!this.abilities.block) {
      throw new Error(`Card ${this.state.id} doesn't have block ability`);
    }

    let abilities = lodash.cloneDeep(this.state.abilities);
    abilities.block.usedInThisTurn = true;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_USE_BLOCK_ABILITY,
      {id: this.id, abilities}
    ));
  }

  public evade (): void {
    if (!this.abilities.evasion) {
      throw new Error(`Card ${this.state.id} doesn't have evasion ability`);
    }

    let abilities = lodash.cloneDeep(this.state.abilities);
    abilities.evasion.usedInThisTurn = true;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_USE_EVASION_ABILITY,
      {id: this.id, abilities}
    ));
  }

  public heal (): void {
    if (!this.abilities.healing) {
      throw new Error(`Card ${this.state.id} doesn't have heal ability`);
    }
    this.tap();
  }

  public healed (heal: number): void {
    let newHp = this.state.currentHp + heal;

    newHp = newHp <= this.state.maxHp ? newHp : this.state.maxHp;

    if (newHp > this.state.currentHp) {
      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_HEALED, {currentHp: newHp, id: this.state.id}
      ));
    }
  }

  public overhealed (heal: number): void {
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

  public toPoison (poisonDamage: number): void {
    let negativeEffects = lodash.cloneDeep(this.state.negativeEffects);

    if (negativeEffects.poisoned) {
      negativeEffects.poisoned.damage = negativeEffects.poisoned.damage + poisonDamage;
    } else {
      negativeEffects.poisoned = {damage: poisonDamage};
    }

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_POISONED,
      {id: this.id, negativeEffects}
    ));
  }

  public removePoison (): void {
    let negativeEffects = lodash.cloneDeep(this.state.negativeEffects);

    negativeEffects.poisoned = null;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_POISON_REMOVED,
      {id: this.id, negativeEffects}
    ));
  }

  public toCurse (damageReduction: number): void {
    let negativeEffects = lodash.cloneDeep(this.state.negativeEffects);

    if (negativeEffects.damageCursed) {
      negativeEffects.damageCursed.damageReduction = negativeEffects.damageCursed.damageReduction + damageReduction;
    } else {
      negativeEffects.damageCursed = {damageReduction: damageReduction};
    }

    let damage = this.state.initialDamage - negativeEffects.damageCursed.damageReduction;

    damage = damage < 0 ? 0 : damage;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_DAMAGE_CURSED,
      {id: this.id, damage, negativeEffects}
    ));
  }

  public removeDamageCurse (): void {
    let negativeEffects = lodash.cloneDeep(this.state.negativeEffects);

    negativeEffects.damageCursed = null;

    this.applyEvent(new Event<CardData>(
      CardEventType.CARD_DAMAGE_CURSE_REMOVED,
      {id: this.id, negativeEffects, damage: this.state.initialDamage}
    ));
  }

  private resetAbilities (): void {
    if (this.abilities.block) {
      let abilities = lodash.cloneDeep(this.state.abilities);

      abilities.block.usedInThisTurn = false;

      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_RESET_BLOCK_ABILITY,
        {id: this.id, abilities}
      ));
    }

    if (this.abilities.evasion) {
      let abilities = lodash.cloneDeep(this.state.abilities);

      abilities.evasion.usedInThisTurn = false;

      this.applyEvent(new Event<CardData>(
        CardEventType.CARD_RESET_EVASION_ABILITY,
        {id: this.id, abilities}
      ));
    }
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
      throw new DomainError('What Is Dead May Never Die.');
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
