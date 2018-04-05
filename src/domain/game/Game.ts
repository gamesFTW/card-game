import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { GameState } from './GameState';
import { GameCreated } from './GameEvents';
import { Player } from '../player/Player';

class Game extends Entity {
  protected state: GameState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new GameState(events);
  }

  public create (player1: Player, player2: Player): void {
    let id = this.generateId();

    this.apply(new GameCreated(
      {id, playerId1: player1.id, playerId2: player2.id}
    ));
  }
}

export {Game};
