import { Config } from './Config';
import { Entity } from './Entity';
import { connect } from 'tls';

class Event<DataType = any, ExtraType = any> {
  public static currentOrderIndex = 0;

  public type: string;
  public data?: DataType;
  public extra?: ExtraType;
  public orderIndex: number;

  public constructor (type: string, data?: DataType, extra?: ExtraType) {
    this.type = type;

    if (data) {
      this.data = data;
    }

    if (extra) {
      this.extra = extra;
    }

    if (Config.isDev) {
      this.orderIndex = Event.currentOrderIndex;
      Event.currentOrderIndex ++;
    }
  }
}

class ClientEvent extends Event {
  static convertFromEvent (event: Event, entity: Entity) : ClientEvent{
    return new ClientEvent(event.type, event.data, entity);
  }

  public constructor (type: string, data: any, entity: Entity) {
    super(type, data, { id: entity.id });
  }

}

export {Event, ClientEvent};
