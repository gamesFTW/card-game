import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { PlayerEventType } from '../events';

interface PlayerData {
  id?: EntityId;
  deck?: Array<EntityId>;
  hand?: Array<EntityId>;
  manaPool?: Array<EntityId>;
  table?: Array<EntityId>;
  graveyard?: Array<EntityId>;
}

interface PlayerDrawnCardData {
  drawnCard?: EntityId;
}

class PlayerState extends EntityState implements PlayerData {
  public deck: Array<EntityId>;
  public hand: Array<EntityId>;
  public manaPool: Array<EntityId>;
  public table: Array<EntityId>;
  public graveyard: Array<EntityId>;

  public constructor (events: Array<Event<PlayerData>>) {
    super(events);
  }

  // Это пример того как можно вручную управлять накатыванием событий.
  protected whenCardDrawn (event: Event<PlayerData, PlayerDrawnCardData>): void {
    this.autoApplyEvent(event);

    // console.log(event.extra.drawnCard);
  }
}

export {PlayerState, PlayerData, PlayerDrawnCardData};
