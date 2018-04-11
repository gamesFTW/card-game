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

class PlayerState extends EntityState implements PlayerData {
  public deck: Array<EntityId>;
  public hand: Array<EntityId>;
  public manaPool: Array<EntityId>;
  public table: Array<EntityId>;
  public graveyard: Array<EntityId>;

  public constructor (events: Array<Event<PlayerData>>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event<PlayerData>): void {
    if (event.type === PlayerEventType.PLAYER_CREATED) {
      this.whenPlayerCreated(event);
    }
    if (event.type === PlayerEventType.DECK_SHUFFLED) {
      this.whenDeckShuffled(event);
    }
    if (event.type === PlayerEventType.CARD_DRAWN) {
      this.whenCardDrawn(event);
    }
  }

  private whenPlayerCreated (event: Event<PlayerData>): void {
    this.id = event.data.id;
    this.deck = event.data.deck;
  }

  private whenDeckShuffled (event: Event<PlayerData>): void {
    this.deck = event.data.deck;
  }

  private whenCardDrawn (event: Event<PlayerData>): void {
    this.deck = event.data.deck;
    this.hand = event.data.hand;
  }
}

export {PlayerState, PlayerData};
