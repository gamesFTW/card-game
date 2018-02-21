import { Event } from '../../infr/Event';
// import {CardCreated, CardDied, CardTookDamage} from "./CardEvents";
import { EntityId, EntityState } from '../../infr/Entity';
import { Tile } from './Tile';
import {CardAddedToField, CardMoved} from './FieldEvents';

interface Tiles {
  [x: number]: {
    [y: number]: Tile
  };
}

class FieldState extends EntityState {
  public id: EntityId;
  public tiles: Tiles = {};

  public constructor (events: Array<Event>) {
    super();
    this.createTiles(5, 5);

    this.applyEvents(events);
  }

  public mutate (event: Event) {
    if (event instanceof CardAddedToField) {
      this.whenCardAddedToField(event as CardAddedToField);
    }
    if (event instanceof CardMoved) {
      this.whenCardMoved(event as CardMoved);
    }
  }

  private createTiles (width: number, height: number) {
    for (let x = 1; x <= width; x++) {
      this.tiles[x] = {};
      let tilesX = this.tiles[x];

      for (let y = 1; y <= height; y++) {
        tilesX[y] = this.createTile();
      }
    }
  }

  private createTile (): Tile {
    return new Tile();
  }

  private whenCardAddedToField (event: CardAddedToField) {
    let cardId = event.data.id;
    let x = event.data.x;
    let y = event.data.y;

    let tile = this.tiles[x][y];
    tile.addCard(cardId);
  }

  private whenCardMoved (event: CardMoved) {
    let cardId = event.data.id;
    let toX = event.data.toX;
    let toY = event.data.toY;
    let fromX = event.data.fromX;
    let fromY = event.data.fromY;

    let fromTile = this.tiles[fromX][fromY];
    fromTile.removeCard(cardId);

    let toTile = this.tiles[toX][toY];
    toTile.addCard(cardId);
  }

}

export {FieldState};
