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
  alive: boolean
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


class CardDied extends Event {
  static TYPE: string = 'CardDied';

  public data: CardDiedData;

  public constructor(data: CardDiedData) {
    super(CardDied.TYPE, data);
  }
}

interface CardDiedData extends EventData {
  alive: boolean
}


export {CardCreated, CardTookDamage, CardDied};
