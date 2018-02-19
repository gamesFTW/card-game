import {Tile} from './Tile';
import {Card} from "../card/Card";
import {Point} from '../../infr/Point';
import {Entity} from "../../infr/Entity";
import { CardAdeedToField } from './FieldEvents';
import {FieldState} from './FieldState';

class Field extends Entity {
  constructor (width: number, height: number) {
    super();
    this.state = new FieldState([]);
  }

  // public getTileByPoint(point: Point): Tile {
  //   return this.tiles[point.x][point.y];
  // }
  //
  // public getPointByCard(card: Card): Point|null {
  //   for (let x in this.tiles) {
  //     for (let y in this.tiles[x]) {
  //       let tile = this.tiles[x][y];
  //       if (tile.checkCard(card)) {
  //         return new Point(Number(x), Number(y));
  //       }
  //     }
  //   }
  //
  //   return null;
  // }
  public addCardToField (card: Card, toPoint: Point) {
    // TODO проверить нет ли на данной клетке карты
    this.apply(new CardAdeedToField({ id: card.state.id, x: toPoint.x, y: toPoint.y }));
  }
}

export {Field};

  // public getTileByCard(card: Card): Tile {
  //   //TODO
  //   return new Tile();
  // }

  // public move(card: Card, point: Point) {
  //   let fromTile = this.getTileByCard(card);
  //   fromTile.removeCard(card);
  //
  //   let toTile = this.getTileByPoint(point);
  //   toTile.addCard(card);
  // }
