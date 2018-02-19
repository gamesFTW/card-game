import {Entity, EntityId, EntityState} from "../../../infr/Entity";
import {Event} from "../../../infr/Event";

class Table extends Entity {
  public state: TableState;

  constructor(events: Array<Event>) {
    super();
    this.state = new TableState(events);
  }
}


class TableState extends EntityState {
  public cardIds: Array<EntityId>;
}
