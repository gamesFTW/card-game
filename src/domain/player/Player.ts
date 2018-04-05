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
    // TODO: save card ids
    let id = this.generateId();

    this.apply(new PlayerCreated(
      {id}
    ));
  }
}

export {Player};
