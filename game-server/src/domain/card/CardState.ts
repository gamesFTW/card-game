import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';

interface Abilities {
  range?: {
    range: number;
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
}

interface CardData {
  id: EntityId;
  hero?: boolean;
  name?: string;
  maxHp?: number;
  currentHp?: number;
  damage?: number;
  alive?: boolean;
  tapped?: boolean;
  manaCost?: number;
  currentMovingPoints?: number;
  abilities?: Abilities;
  image?: string;
}

class CardState extends EntityState implements CardData {
  public id: EntityId;
  public hero: boolean;
  public name: string;
  public maxHp: number;
  public currentHp: number;
  public damage: number;
  public alive: boolean = false;
  public tapped: boolean = false;
  public currentMovingPoints: number;
  public manaCost: number;
  public abilities: Abilities;
  public image: string;

  public constructor (events: Array<Event<CardData>>) {
    super();
    this.applyEvents(events);
  }
}

export {CardState, CardData, Abilities};
