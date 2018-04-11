import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { CardEventType } from '../events';

interface CardData {
  id?: EntityId;
  name?: string;
  maxHp?: number;
  currentHp?: number;
  damage?: number;
  alive?: boolean;
  tapped?: boolean;
}

class CardState extends EntityState {
  public id: EntityId;
  public name: string;
  public maxHp: number;
  public currentHp: number;
  public damage: number;
  public alive: boolean;
  public tapped: boolean;

  public constructor (events: Array<Event<CardData>>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event<CardData>): void {
    if (event.type === CardEventType.CARD_CREATED) {
      this.whenCardCreated(event);
    }
    // if (event instanceof CardTookDamage) {
    //   this.whenCardTookDamage(event as CardTookDamage);
    // }
    // if (event instanceof CardDied) {
    //   this.whenCardDied(event as CardDied);
    // }
    // if (event instanceof CardTapped) {
    //   this.whenCardTapped(event as CardTapped);
    // }
  }

  whenCardCreated (event: Event<CardData>): void {
    this.id = event.data.id;
    this.name = event.data.name;
    this.damage = event.data.damage;
    this.maxHp = event.data.maxHp;
  }

  // whenCardTookDamage (event: CardTookDamage) {
  //   this.hp = event.data.hp;
  // }
  //
  // whenCardDied (event: CardDied) {
  //   this.alive = event.data.alive;
  // }
  //
  // whenCardTapped (event: CardTapped) {
  //   this.tapped = event.data.tapped;
  // }
}

export {CardState, CardData};
