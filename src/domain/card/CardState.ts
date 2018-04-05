import { Event } from '../../infr/Event';
import { CardCreated } from './CardEvents';
import { EntityId, EntityState } from '../../infr/Entity';

class CardState extends EntityState {
  public id: EntityId;
  public name: string;
  public maxHp: number;
  public currentHp: number;
  public damage: number;
  public alive: boolean;
  public tapped: boolean;

  public constructor (events: Array<Event>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event) {
    if (event instanceof CardCreated) {
      this.whenCardCreated(event as CardCreated);
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

  whenCardCreated (event: CardCreated) {
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

export {CardState};
