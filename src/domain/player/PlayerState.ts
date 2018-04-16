import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';
import { PlayerEventType } from '../events';
import { PlayerStatus } from './Player';

interface PlayerData {
  id: EntityId;
  deck?: Array<EntityId>;
  hand?: Array<EntityId>;
  mannaPool?: Array<EntityId>;
  table?: Array<EntityId>;
  graveyard?: Array<EntityId>;
  status?: PlayerStatus;
}

interface PlayerDrawnCardData {
  drawnCard?: EntityId;
}

class PlayerState extends EntityState implements PlayerData {
  public deck: Array<EntityId> = [];
  public hand: Array<EntityId> = [];
  public mannaPool: Array<EntityId> = [];
  public table: Array<EntityId> = [];
  public graveyard: Array<EntityId> = [];
  public status: PlayerStatus = PlayerStatus.WAITING_FOR_TURN;

  public constructor (events: Array<Event<PlayerData>>) {
    super();
    this.applyEvents(events);
  }
}

export {PlayerState, PlayerData, PlayerDrawnCardData};
