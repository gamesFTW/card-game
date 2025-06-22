import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';

type BoardObjects = {[key: number]: {[key: number]: EntityId}};

interface BoardData {
  id?: EntityId;
  width?: number;
  height?: number;
  units?: BoardObjects;
  areas?: BoardObjects;
}

class BoardState extends EntityState implements BoardData {
  public id: EntityId;
  public width: number;
  public height: number;
  public units: BoardObjects;
  public areas: BoardObjects;

  public constructor (events: Array<Event>) {
    super();

    this.applyEvents(events);
  }
}

export {BoardState, BoardData, BoardObjects};
