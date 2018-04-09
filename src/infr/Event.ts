import { EntityId } from './Entity';

// Улучшение ивенотов.
// Вообще можно для каждого агрегата создать одно событие
// с полями этого агрегата, и всегда использовать его.
// Тогда не придётся городить тучу событий, что выглядит очень заманчиво.
// Проблема будет только если понадобится дополнительные параметры.
// Хотя всегда можно добавить поле extra.

// Улучшение стейта.
// Можно автоматизировать накатываение данных из event в state.

class Event {
  public type: string;
  public data: EventData;

  public constructor (type: string, data: EventData) {
    this.type = type;

    this.data = {...data};
  }
}

interface EventData {
  id: EntityId;
}

export {Event, EventData};
