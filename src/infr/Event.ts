import { EntityId } from './Entity';

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
