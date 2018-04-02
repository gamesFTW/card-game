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

// class CardMoved extends Event {
//   static TYPE: string = 'CardMoved';

//   public data: CardMovedData;

//   public constructor (data: CardMovedData) {
//     super(CardMoved.TYPE, data);
//   }
// }

// interface CardMovedData extends EventData {
//   toX: number;
//   toY: number;
//   fromX: number;
//   fromY: number;
// }

export {GameCreated, GameCreatedData};
