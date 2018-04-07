import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { PlayerState } from './PlayerState';
import { PlayerCreated } from './PlayerEvents';
import { Card } from '../card/Card';

class Player extends Entity {
  protected state: PlayerState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new PlayerState(events);
  }

  public create (cards: Array<Card>): void {
    let id = this.generateId();
    let cardIds = cards.map((card: Card) => card.id);

    this.apply(new PlayerCreated(
      {id, cardIds}
    ));
  }
}

export {Player};
