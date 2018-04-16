import { EntityId } from './Entity';

class Event<DataType = any, ExtraType = any> {
  public type: string;
  public data?: DataType;
  public extra?: ExtraType;

  // TODO: отрефакторить, добавить aggregateID, и перестать всегда передавать id в data
  public constructor (type: string, data?: DataType, extra?: ExtraType) {
    this.type = type;

    if (data) {
      this.data = data;
    }

    if (extra) {
      this.extra = extra;
    }
  }
}

export {Event};
