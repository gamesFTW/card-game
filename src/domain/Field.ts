import {Tile} from "./Tile";
import {Card} from "./Card";
import {Point} from "./Point";


interface Tiles {
  [x: number]: {
    [y: number]: Tile
  };
}


class Field {
  private tiles: Tiles = {};

  constructor(width: number, height: number) {
    this.createTiles(width, height);
  }

  public getTileByPoint(point: Point): Tile {
    return this.tiles[point.x][point.y];
  }

  public getPointByCard(card: Card): Point|null {
    for (let x in this.tiles) {
      for (let y in this.tiles[x]) {
        let tile = this.tiles[x][y];
        if (tile.checkCard(card)) {
          return new Point(Number(x), Number(y));
        }
      }
    }

    return null;
  }

  private createTiles(width: number, height: number) {
    for (let x = 1; x <= width; x++) {
      this.tiles[x] = {};
      let tilesX = this.tiles[x];

      for (let y = 1; y <= height; y++) {
        tilesX[y] = this.createTile();
      }
    }
  }

  private createTile(): Tile {
    return new Tile();
  }
}

export {Field};
