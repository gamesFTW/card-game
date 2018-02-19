import { Event } from '../../infr/Event';
// import {CardCreated, CardDied, CardTookDamage} from "./CardEvents";
import { EntityId, EntityState } from '../../infr/Entity';
import { Tile } from './Tile';
import { CardAdeedToField } from './FieldEvents';

interface Tiles {
  [x: number]: {
    [y: number]: Tile
  };
}

class FieldState extends EntityState {
  public id: EntityId;
  public tiles: Tiles;

  public constructor (events: Array<Event>) {
    super(events);

    this.createTiles(5, 5);
  }

  public mutate (event: Event) {
    if (event instanceof CardAdeedToField) {
      this.whenCardAdeedToField(event as CardAdeedToField);
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

  private whenCardAdeedToField (event: CardAdeedToField) {
    let cardId = event.data.id;
    let x = event.data.x;
    let y = event.data.y;

    let tile = this.tiles[x][y];
    tile.addCard(cardId);
  }

}

export {FieldState};
