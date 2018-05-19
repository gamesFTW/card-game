import { Config } from './Config';

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

export {Event};
