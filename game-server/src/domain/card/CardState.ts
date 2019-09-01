import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';

/*
  URL to make a JSON scheme http://lbovet.github.io/typson-demo/
*/
interface Abilities {
  range?: {
    range: number;
    minRange?: number;
    blockedInBeginningOfTurn: boolean;
  };
  firstStrike?: boolean;
  armored?: {
    armor: number;
  };
  vampiric?: boolean;
  noEnemyRetaliation?: boolean;
  piercing?: boolean;
  speed?: {
    speed: number;
  };
  flanking?: {
    damage: number;
  };
  push?: {
    range: number;
  };
  ricochet?: boolean;
  healing?: {
    range: number;
    heal: number;
  };
  block?: {
    range: number;
    blockingDamage: number;
    usedInThisTurn: boolean;
  };
  mana?: {
    mana: number;
  };
  regeneration?: {
    regeneration: number;
  };
  bash?: boolean;
  evasion?: {
    usedInThisTurn: boolean;
  };
  poison?: {
    poisonDamage: number;
  };
  damageCurse?: {
    damageReduction: number;
  };
  aoe?: {
    range: number;
    diagonal: boolean;
  };
  hpAura?: {
    range: number;
    hpBuff: number;
  };
}

interface NegativeEffects {
  poisoned?: {damage: number};
  damageCursed?: {damageReduction: number};
}

interface PositiveEffects {
  hpAuraBuff?: {hpBuff: number};
}

interface CardData {
  id: EntityId;
  hero?: boolean;
  name?: string;
  maxHp?: number;
  currentHp?: number;
  initialDamage?: number;
  damage?: number;
  alive?: boolean;
  tapped?: boolean;
  manaCost?: number;
  currentMovingPoints?: number;
  abilities?: Abilities;
  negativeEffects?: NegativeEffects;
  positiveEffects?: PositiveEffects;
  image?: string;
  attackSound?: string;
  sounds?: {[key: string]: {soundName: string; url: string}};
}

class CardState extends EntityState implements CardData {
  public id: EntityId;
  public hero: boolean;
  public name: string;
  public maxHp: number;
  public currentHp: number;
  public damage: number;
  public initialDamage: number;
  public alive: boolean = false;
  public tapped: boolean = false;
  public currentMovingPoints: number;
  public manaCost: number;
  public abilities: Abilities;
  public negativeEffects: NegativeEffects;
  public positiveEffects: PositiveEffects;
  public image: string;
  public sounds: {[key: string]: {soundName: string; url: string}};

  public constructor (events: Array<Event<CardData>>) {
    super();
    this.applyEvents(events);
  }
}

export {CardState, CardData, Abilities, NegativeEffects, PositiveEffects};
