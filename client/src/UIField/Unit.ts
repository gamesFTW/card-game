import { pointerToIcometric } from './isometric';
import { CardData } from '../typings/Cards';

class Unit {
  private cardData: CardData;

  constructor (cardData: CardData) {
    this.cardData = cardData;
  }

  addToScene (scene: Phaser.Scene): void {
    if (this.cardData.alive && this.cardData.x && this.cardData.y) {
      let position = pointerToIcometric({x: this.cardData.x, y: this.cardData.y});
      scene.add.sprite(position.x, position.y, 'orc');
    }
  }
}

export {Unit};
