import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { GameEventType, PlayerEventType } from '../events';

interface GameData {
  id?: EntityId;
  player1Id?: EntityId;
  player2Id?: EntityId;
  currentPlayersTurn?: EntityId;
  boardId?: EntityId;
  currentTurn?: number;
}

class GameState extends EntityState implements GameData {
  public player1Id: EntityId;
  public player2Id: EntityId;
  public currentPlayersTurn: EntityId;
  public boardId: EntityId;
  public currentTurn: number = 1;

  public constructor (events: Array<Event<GameData>>) {
    super();
    this.applyEvents(events);
  }
}

export {GameState, GameData};
