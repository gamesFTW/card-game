import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { CardEventType } from '../events';

interface CardData {
  id?: EntityId;
  name?: string;
  maxHp?: number;
  currentHp?: number;
  damage?: number;
  alive?: boolean;
  tapped?: boolean;
}

class CardState extends EntityState {
  public id: EntityId;
  public name: string;
  public maxHp: number;
  public currentHp: number;
  public damage: number;
  public alive: boolean;
  public tapped: boolean = false;

  public constructor (events: Array<Event<CardData>>) {
    super();
    this.applyEvents(events);
  }
}

export {CardState, CardData};
