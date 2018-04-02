import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { GameState } from './GameState';
import { GameCreated } from './GameEvents';

class Game extends Entity {
  protected state: GameState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new GameState(events);
  }

  get id (): EntityId { return this.state.id; }

  public create (player1: any, player2: any): void {
    let id = this.generateId();

    this.apply(new GameCreated(
      {id, playerId1: player1.id, playerId2: player2.id}
    ));
  }
  // private cards: Array<EntityId> = [];

  // public addCard (cardId: EntityId) {
  //   this.cards.push(cardId);
  // }

  // public removeCard (cardId: EntityId) {
  //   let cardIndex = this.cards.indexOf(cardId);
  //   if (cardIndex < 0) {
  //     throw new Error(`Not found card ${cardId} in tile.`);
  //   }
  //   this.cards.splice(cardIndex, 1);
  // }

  // public checkCard (cardId: EntityId): boolean {
  //   return this.cards.indexOf(cardId) !== -1;
  // }
}

export {Game};
