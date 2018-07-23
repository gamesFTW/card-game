import 'phaser';
// import { BootScene } from './scenes/bootScene';
// import { MainMenuScene } from './scenes/mainMenuScene';
import { GameScene } from './GameScene';

const config: GameConfig = {
  title: 'Snake',
  // url: 'https://github.com/digitsensitive/phaser3-typescript',
  // version: '1.1',
  width: 1600,
  height: 900,
  zoom: 1,
  type: Phaser.AUTO,
  parent: 'game',
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
  constructor (width: number, height: number) {
    super(config);

    this.scene.start('GameScene', { width, height });
  }
}

export {Game};
