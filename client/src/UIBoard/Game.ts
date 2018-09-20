import 'phaser';
// import { BootScene } from './scenes/bootScene';
// import { MainMenuScene } from './scenes/mainMenuScene';
import { GameScene } from './GameScene';
import { GamePayload } from '../UI/components/Main/Main';

const config: GameConfig = {
  title: 'MegaGame',
  // url: 'https://github.com/digitsensitive/phaser3-typescript',
  // version: '1.1',
  width: 1600,
  height: 900,
  zoom: 1,
  type: Phaser.AUTO,
  parent: 'field',
  scene: [GameScene],
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false
  },
  backgroundColor: '#000000'
  // pixelArt: true,
  // antialias: false
};

class Game extends Phaser.Game {
  private width: number;
  private height: number;

  constructor (width: number, height: number, gamePayload: GamePayload) {
    super(config);
    this.width = width;
    this.height = height;

    this.scene.start('GameScene', { width, height, gamePayload });
  }

  updateGamePayload (gamePayload: GamePayload): void {
    this.scene.stop('GameScene');
    this.scene.start('GameScene', { width: this.width, height: this.height, gamePayload });
  }
}

export {Game as UIBoard};
