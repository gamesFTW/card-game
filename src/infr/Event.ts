import { EntityId } from './Entity';

class Event<DataType = any, ExtraType = any> {
  public type: string;
  public data?: DataType;
  public extra?: ExtraType;
  public date: Date;
  public aggregateId: EntityId;

  public constructor (type: string, data?: DataType, extra?: ExtraType) {
    this.type = type;

    if (data) {
      this.data = data;
    }

    if (extra) {
      this.extra = extra;
    }

    this.date = new Date();
  }
}

export {Event};
