import {EventData, Event} from "../../infr/Event";


class CardCreated extends Event {
  static TYPE: string = 'CardCreated';

  public data: CardCreatedData;

  public constructor(data: CardCreatedData) {
    super(CardCreated.TYPE, data);
  }
}

interface CardCreatedData extends EventData {
  name: string;
  hp: number;
}


class CardTookDamage extends Event {
  static TYPE: string = 'CardTookDamage';

  public data: CardTookDamageData;

  public constructor(data: CardTookDamageData) {
    super(CardTookDamage.TYPE, data);
  }
}

interface CardTookDamageData extends EventData {
  hp: number;
}

export {CardCreated, CardTookDamage};
