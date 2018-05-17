import { Event } from '../../infr/Event';
import { EntityId, EntityState } from '../../infr/Entity';

type EntityPositions = {[key: number]: {[key: number]: EntityId}};

interface FieldData {
  id?: EntityId;
  width?: number;
  height?: number;
  units?: EntityPositions;
}

class FieldState extends EntityState implements FieldData {
  public id: EntityId;
  public width: number;
  public height: number;
  public units: EntityPositions;
  // public areas: {[key: number]: {[key: number]: EntityId}};

  public constructor (events: Array<Event>) {
    super();

    this.applyEvents(events);
  }

  // private createTiles (width: number, height: number) {
  //   for (let x = 1; x <= width; x++) {
  //     this.tiles[x] = {};
  //     let tilesX = this.tiles[x];
  //
  //     for (let y = 1; y <= height; y++) {
  //       tilesX[y] = this.createTile();
  //     }
  //   }
  // }
  //
  // private createTile (): Tile {
  //   return new Tile();
  // }
  //
  // private whenCardAddedToField (event: CardAddedToField) {
  //   let cardId = event.data.id;
  //   let x = event.data.x;
  //   let y = event.data.y;
  //
  //   let tile = this.tiles[x][y];
  //   tile.addCard(cardId);
  // }
  //
  // private whenCardMoved (event: CardMoved) {
  //   let cardId = event.data.id;
  //   let toX = event.data.toX;
  //   let toY = event.data.toY;
  //   let fromX = event.data.fromX;
  //   let fromY = event.data.fromY;
  //
  //   let fromTile = this.tiles[fromX][fromY];
  //   fromTile.removeCard(cardId);
  //
  //   let toTile = this.tiles[toX][toY];
  //   toTile.addCard(cardId);
  // }

}

export {FieldState, FieldData, EntityPositions};
