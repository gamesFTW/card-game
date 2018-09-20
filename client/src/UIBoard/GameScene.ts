

// import { Apple } from "../objects/apple";
// import { Snake } from "../objects/snake";
// import { CONST } from "../const/const";

import { Tile } from './Tile';
import { GamePayload } from '../UI/components/Main/Main';
import autobind from 'autobind-decorator';
import { CardData } from '../typings/Cards';
import { Unit } from './Unit';

interface GameSceneParams {
  width: number;
  height: number;
  gamePayload: GamePayload;
}

export class GameScene extends Phaser.Scene {
  private width: number;
  private height: number;
  private gamePayload: GamePayload;

  private tiles: {[x: number]: {[y: number]: Tile}} = {};
  private units: {[id: string]: Unit} = {};

  constructor () {
    super({
      key: 'GameScene'
    });
  }

  init (data: GameSceneParams): void {
    this.width = data.width;
    this.height = data.height;
    this.gamePayload = data.gamePayload;
  }

  preload (): void {
    // this.cameras.main.setBackgroundColor(0x98d687);

    this.load.image('tile', 'http://localhost:3000/img/tile.png');
    this.load.image('orc', 'http://localhost:3000/img/creature-armored-fat-and-shield1.png');
  }

  create (): void {
    this.createTiles();
    this.createUnits();
  }

  createTiles (): void {
    for (let x = 1; x <= this.width; x++) {
      this.tiles[x] = {};

      for (let y = 1; y <= this.height; y++) {
        this.tiles[x][y] = this.createTile(x, y);
      }
    }
  }

  createUnits (): void {
    this.gamePayload.player.table.forEach(this.createUnit);
    this.gamePayload.opponent.table.forEach(this.createUnit);
  }

  createTile (x: number, y: number): Tile {
    let tile = new Tile();
    tile.addToScene(this, x, y);
    return tile;
  }

  @autobind
  createUnit (cardData: CardData): Unit|null {
    if (cardData.alive) {
      let unit = new Unit(cardData);
      unit.addToScene(this);

      this.units[cardData.id] = unit;

      return unit;
    }

    return null;
  }
}
