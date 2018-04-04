import { EventData, Event } from '../../infr/Event';
import { EntityId } from '../../infr/Entity';

class GameCreated extends Event {
  static TYPE: string = 'GameCreated';

  public data: GameCreatedData;

  public constructor (data: GameCreatedData) {
    super(GameCreated.TYPE, data);
  }
}

interface GameCreatedData extends EventData {
  id: EntityId;
  playerId1: EntityId;
  playerId2: EntityId;
}

export {GameCreated, GameCreatedData};
