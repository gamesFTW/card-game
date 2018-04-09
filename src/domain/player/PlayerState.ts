import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { GameCreated } from '../game/GameEvents';
import { CardDrawn, DeckShuffled, PlayerCreated } from './PlayerEvents';

class PlayerState extends EntityState {
  public deck: Array<EntityId>;
  public hand: Array<EntityId>;
  public manaPool: Array<EntityId>;
  public table: Array<EntityId>;
  public graveyard: Array<EntityId>;

  public constructor (events: Array<Event>) {
    super();
    this.applyEvents(events);
  }

  public mutate (event: Event): void {
    if (event instanceof PlayerCreated) {
      this.whenPlayerCreated(event as PlayerCreated);
    }
    if (event instanceof DeckShuffled) {
      this.whenDeckShuffled(event as DeckShuffled);
    }
    if (event instanceof CardDrawn) {
      this.whenCardDrawn(event as CardDrawn);
    }
  }

  private whenPlayerCreated (event: PlayerCreated): void {
    this.id = event.data.id;
    this.deck = event.data.deck;
  }

  private whenDeckShuffled (event: DeckShuffled): void {
    this.deck = event.data.deck;
  }

  private whenCardDrawn (event: CardDrawn): void {
    this.deck = event.data.deck;
    this.hand = event.data.hand;
  }
}

export {PlayerState};
