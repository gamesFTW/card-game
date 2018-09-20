import { pointerToIcometric } from './isometric';

class Tile {
  addToScene (scene: Phaser.Scene, x: number, y: number): void {
    let position = pointerToIcometric({x, y});
    scene.add.sprite(position.x, position.y, 'tile');
  }
}

export {Tile};
