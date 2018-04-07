import { EventData, Event } from '../../infr/Event';
import { EntityId } from '../../infr/Entity';

class PlayerCreated extends Event {
  static TYPE: string = 'PlayerCreated';

  public data: PlayerCreatedData;

  public constructor (data: PlayerCreatedData) {
    super(PlayerCreated.TYPE, data);
  }
}

interface PlayerCreatedData extends EventData {
  id: EntityId;
  cardIds: Array<EntityId>;
}

export {PlayerCreated, PlayerCreatedData};