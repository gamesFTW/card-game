import { EventData, Event } from '../../infr/Event';
import { EntityId } from '../../infr/Entity';

// PlayerCreated
class PlayerCreated extends Event {
  static TYPE: string = 'PlayerCreated';

  public data: PlayerCreatedData;

  public constructor (data: PlayerCreatedData) {
    super(PlayerCreated.TYPE, data);
  }
}

interface PlayerCreatedData extends EventData {
  id: EntityId;
  deck: Array<EntityId>;
}

// DeckShuffled
class DeckShuffled extends Event {
  static TYPE: string = 'DeckShuffled';

  public data: DeckShuffledData;

  public constructor (data: DeckShuffledData) {
    super(DeckShuffled.TYPE, data);
  }
}

interface DeckShuffledData extends EventData {
  id: EntityId;
  deck: Array<EntityId>;
}

// CardDrawn
class CardDrawn extends Event {
  static TYPE: string = 'CardDrawn';

  public data: CardDrawnData;

  public constructor (data: CardDrawnData) {
    super(CardDrawn.TYPE, data);
  }
}

interface CardDrawnData extends EventData {
  id: EntityId;
  deck: Array<EntityId>;
  hand: Array<EntityId>;
}

export {PlayerCreated, DeckShuffled, CardDrawn};
