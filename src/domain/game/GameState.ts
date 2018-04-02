import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';

class GameState extends EntityState {
  public id: EntityId;

  public constructor (events: Array<Event>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event): void {
    // if (event instanceof CardAddedToField) {
    //   this.whenCardAddedToField(event as CardAddedToField);
    // }
    // if (event instanceof CardMoved) {
    //   this.whenCardMoved(event as CardMoved);
    // }
  }

  // private whenCardAddedToField (event: CardAddedToField) {
  //   let cardId = event.data.id;
  //   let x = event.data.x;
  //   let y = event.data.y;

  //   let tile = this.tiles[x][y];
  //   tile.addCard(cardId);
  // }

}

export {GameState};
