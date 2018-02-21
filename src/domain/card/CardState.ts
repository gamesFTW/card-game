import {Event} from "../../infr/Event";
import {CardCreated, CardDied, CardTookDamage} from "./CardEvents";
import {EntityId, EntityState} from "../../infr/Entity";

class CardState extends EntityState {
  public id: EntityId;
  public name: string;
  public hp: number;
  public alive: boolean;

  public constructor (events: Array<Event>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event) {
    if (event instanceof CardCreated) {
      this.whenCardCreated(event as CardCreated);
    }
    if (event instanceof CardTookDamage) {
      this.whenCardTookDamage(event as CardTookDamage);
    }
    if (event instanceof CardDied) {
      this.whenCardDied(event as CardDied);
    }
  }

  whenCardCreated (event: CardCreated) {
    this.id = event.data.id;
    this.name = event.data.name;
    this.hp = event.data.hp;
    this.alive = event.data.alive;
  }

  whenCardTookDamage (event: CardTookDamage) {
    this.hp = event.data.hp;
  }

  whenCardDied (event: CardDied) {
    this.alive = event.data.alive;
  }
}

export {CardState};
