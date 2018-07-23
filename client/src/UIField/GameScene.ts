

// import { Apple } from "../objects/apple";
// import { Snake } from "../objects/snake";
// import { CONST } from "../const/const";

import { Tile } from './Tile';
import {pointerToIcometric} from './isometric';

interface GameSceneParams {
  width: number;
  height: number;
}

export class GameScene extends Phaser.Scene {
  private width: number;
  private height: number;

  private tiles: {[x: number]: {[y: number]: Tile}} = {};

  // field and game setting
  // private fieldSize: number;
  // private gameHeight: number;
  // private gameWidth: number;
  // private boardWidth: number;
  // private boardHeight: number;
  // private horizontalFields: number;
  // private verticalFields: number;
  // private tick: number;

  // objects
  // private player: Snake;
  // private apple: Apple;
  // private gameBorder: Phaser.GameObjects.Graphics[];

  // texts
  private scoreText: Phaser.GameObjects.BitmapText;

  constructor () {
    super({
      key: 'GameScene'
    });
  }

  init (data: GameSceneParams): void {
    this.width = data.width;
    this.height = data.height;
  }

  preload (): void {
    // this.cameras.main.setBackgroundColor(0x98d687);

    this.load.image('tile', 'http://localhost:3000/img/tile.png');
  }

  create (): void {
    this.createTiles();
  }

  createTiles (): void {
    for (let x = 0; x < this.width; x++) {
      this.tiles[x] = {};

      for (let y = 0; y < this.height; y++) {
        this.tiles[x][y] = this.createTile(x, y);
      }
    }
  }

  createTile (x: number, y: number): Tile {
    let position = pointerToIcometric({x, y});
    this.add.sprite(position.x, position.y, 'tile');

    return new Tile();
  }

  // create(): void {
  //   // objects
  //   this.gameBorder = [];
  //   let i = 0;
  //   for (let x = 0; x < this.gameWidth / this.fieldSize; x++) {
  //     for (let y = 0; y < this.gameHeight / this.fieldSize; y++) {
  //       if (
  //         y === 0 ||
  //         y === this.gameHeight / this.fieldSize - 1 ||
  //         x === 0 ||
  //         x === this.gameWidth / this.fieldSize - 1
  //       ) {
  //         this.gameBorder[i] = this.add
  //           .graphics({
  //             x: -this.fieldSize + x * this.fieldSize,
  //             y: -this.fieldSize + y * this.fieldSize,
  //             fillStyle: { color: 0x61e85b, alpha: 0.3 }
  //           })
  //           .fillRect(
  //             this.fieldSize,
  //             this.fieldSize,
  //             this.fieldSize,
  //             this.fieldSize
  //           );
  //         i++;
  //       }
  //     }
  //   }
  //
  //   this.player = new Snake(this);
  //   this.apple = new Apple(this, {
  //     xPos: this.rndXPos(),
  //     yPos: this.rndYPos(),
  //     fSize: this.fieldSize
  //   });
  //
  //   // text
  //   this.scoreText = this.add.bitmapText(
  //     this.gameWidth / 2,
  //     1,
  //     "snakeFont",
  //     "" + CONST.SCORE,
  //     8
  //   );
  // }
  //
  // update(time): void {
  //   if (this.tick === 0) {
  //     this.tick = time;
  //   }
  //   if (!this.player.isDead()) {
  //     if (time - this.tick > 100) {
  //       this.player.move();
  //       this.checkCollision();
  //       this.tick = time;
  //     }
  //     this.player.handleInput();
  //   } else {
  //     this.scene.start("MainMenuScene");
  //   }
  // }
  //
  // private checkCollision(): void {
  //   // player vs. apple collision
  //   if (
  //     this.player.getHead().x === this.apple.x &&
  //     this.player.getHead().y === this.apple.y
  //   ) {
  //     this.player.growSnake(this);
  //     CONST.SCORE++;
  //     this.scoreText.setText("" + CONST.SCORE);
  //     this.apple.newApplePosition(this.rndXPos(), this.rndYPos());
  //   }
  //
  //   // border vs. snake collision
  //   for (let i = 0; i < this.gameBorder.length; i++) {
  //     if (
  //       this.player.getHead().x === this.gameBorder[i].x &&
  //       this.player.getHead().y === this.gameBorder[i].y
  //     ) {
  //       this.player.setDead(true);
  //     }
  //   }
  //
  //   // snake vs. snake collision
  //   this.player.checkSnakeSnakeCollision();
  // }
  //
  // private rndXPos(): number {
  //   return (
  //     Phaser.Math.RND.between(1, this.horizontalFields - 1) * this.fieldSize
  //   );
  // }
  //
  // private rndYPos(): number {
  //   return Phaser.Math.RND.between(1, this.verticalFields - 1) * this.fieldSize;
  // }
}
