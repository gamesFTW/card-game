import { Point } from '../../../infr/Point';

export class ReachChecker {
  private tiles: Tile[][] = [];
  private tilesForCheck: Tile[] = [];
  private resultedPoints: Point[] = [];

  private width: number;
  private height: number;
  private distance: number;

  public constructor (width: number, height: number) {
    this.width = width;
    this.height = height;

    for (let x: number = 1; x <= width; x++) {
      if (this.tiles[x] === undefined) {
        this.tiles[x] = [];
      }

      for (let y: number = 1; y <= height; y++) {
        this.tiles[x][y] = new Tile(x, y);
      }
    }
  }

  public addBlocker (point: Point, canWalkThrough: boolean = false): void {
    const tile = this.tiles[point.x][point.y];
    tile.canWalkThroughIt = canWalkThrough;
    tile.canWalkToIt = false;
  }

  public checkReach (point: Point, distance: number): Point[] {
    this.distance = distance;
    const tile = this.tiles[point.x][point.y];
    this.tilesForCheck.push(tile);
    tile.isChecked = true;

    this.checkTile();

    // TODO: Щас алгоритм возвращает дублирующиеся поинты
    return this.resultedPoints;
  }

  private checkTile (): void {
    if (this.tilesForCheck.length > 0) {
      const tile = this.tilesForCheck[0];
      this.tilesForCheck.shift();

      const tileDistance = tile.distance;

      this.checkNeighbour(tile.x - 1, tile.y, tileDistance);
      this.checkNeighbour(tile.x + 1, tile.y, tileDistance);
      this.checkNeighbour(tile.x, tile.y - 1, tileDistance);
      this.checkNeighbour(tile.x, tile.y + 1, tileDistance);

      this.checkTile();
    }
  }

  private checkNeighbour (x: number, y: number, tileDistance: number): void {
    if (x < 1 || y < 1 || x > this.width || y > this.height) {
      return;
    }

    const tile = this.tiles[x][y];

    if (!tile.isChecked && tileDistance + 1 <= this.distance) {
      if (tile.canWalkToIt || tile.canWalkThroughIt) {
        tile.isChecked = true;
        tile.distance = tileDistance + 1;
        this.tilesForCheck.push(tile);

        if (tile.canWalkToIt) {
          this.resultedPoints.push(new Point(x, y));
        }
      }
    }
  }
}

class Tile {
  public canWalkThroughIt: boolean = true;
  public canWalkToIt: boolean = true;

  public x: number;
  public y: number;

  public isChecked: boolean = false;
  public distance: number = 0;

  public constructor (x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
