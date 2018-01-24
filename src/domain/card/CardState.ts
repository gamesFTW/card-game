import {Event} from "../../infr/Event";
import {CardCreated, CardTookDamage} from "./CardEvents";

class CardState {
  public name: string;
  public id: string;
  public hp: number;

  public constructor(events: Array<Event>) {
    events.forEach(event => this.mutate(event));
  }

  public mutate(event: Event) {
    if (event instanceof CardCreated) {
      this.whenCardCreated(event as CardCreated);
    }
    if (event instanceof CardTookDamage) {
      this.whenCardTookDamage(event as CardTookDamage);
    }
    // console.log(event);
  }

  whenCardCreated(event: CardCreated) {
    this.id = event.data.id;
    this.name = event.data.name;
    this.hp = event.data.hp;
  }

  whenCardTookDamage(event: CardTookDamage) {
    this.hp = event.data.hp;
  }
}

export {CardState};
