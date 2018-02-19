import { EventData, Event } from "../../infr/Event";

class CardAdeedToField extends Event {
  static TYPE: string = 'CardAdeedToField';

  public data: CardAddedData;

  public constructor (data: CardAddedData) {
    super(CardAdeedToField.TYPE, data);
  }
}

interface CardAddedData extends EventData {
  x: number;
  y: number;
}

export {CardAdeedToField};
