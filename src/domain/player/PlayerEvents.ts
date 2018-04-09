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
  // Хранение данных в ивенте:
  // 1. Посчитанные данные
  // 2. Не посчитанные данные
  // Надо ли делать так или передавать drawnCard?

  // Итого: используем не посчитанные данные
  // + доп параметры для UI
  // А так же пока не авто накатываем стейт.
  // По поводу сокращения ивентов можно подумать.
}

export {PlayerCreated, DeckShuffled, CardDrawn};
