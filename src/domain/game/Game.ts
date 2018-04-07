import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { GameState } from './GameState';
import { GameCreated } from './GameEvents';
import { Player } from '../player/Player';

class Game extends Entity {
  protected state: GameState;

  get player1Id (): EntityId { return this.state.player1Id; }
  get player2Id (): EntityId { return this.state.player2Id; }

  constructor (events: Array<Event> = []) {
    super();
    this.state = new GameState(events);
  }

  public create (player1: Player, player2: Player): void {
    let id = this.generateId();

    this.apply(new GameCreated(
      {id, player1Id: player1.id, player2Id: player2.id}
    ));
  }
}

export {Game};
