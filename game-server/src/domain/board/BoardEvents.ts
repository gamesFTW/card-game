import { EventData, Event } from '../../infr/Event';

class CardAddedToBoard extends Event {
  static TYPE: string = 'CardAddedToBoard';

  public data: CardAddedData;

  public constructor (data: CardAddedData) {
    super(CardAddedToBoard.TYPE, data);
  }
}

interface CardAddedData extends EventData {
  x: number;
  y: number;
}

class CardMoved extends Event {
  static TYPE: string = 'CardMoved';

  public data: CardMovedData;

  public constructor (data: CardMovedData) {
    super(CardMoved.TYPE, data);
  }
}

interface CardMovedData extends EventData {
  toX: number;
  toY: number;
  fromX: number;
  fromY: number;
}

export {CardAddedToBoard, CardMoved};
