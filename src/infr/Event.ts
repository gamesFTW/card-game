import { EntityId } from './Entity';

class Event<T = any> {
  public type: string;
  public data?: T;

  public constructor (type: string, data?: T) {
    this.type = type;

    if (data) {
      this.data = data;
    }
  }
}

export {Event};
