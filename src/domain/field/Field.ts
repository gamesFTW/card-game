import { Tile } from './Tile';
import { Card } from '../card/Card';
import { Point } from '../../infr/Point';
import { Entity } from '../../infr/Entity';
import { CardAddedToField, CardMoved } from './FieldEvents';
import { FieldState } from './FieldState';
import { CardState } from '../card/CardState';
import { Event } from '../../infr/Event';

class Field extends Entity {
  protected state: FieldState;

  constructor (events: Array<Event> = [], width: number, height: number) {
    super();
    this.state = new FieldState(events);
  }

  // public getTileByPoint(point: Point): Tile {
  //   return this.tiles[point.x][point.y];
  // }
  //
  public getPointByCard (card: Card): Point|null {
    // console.log(JSON.stringify(this.state));
    for (let x in this.state.tiles) {
      for (let y in this.state.tiles[x]) {
        let tile = this.state.tiles[x][y];
        if (tile.checkCard (card.id)) {
          return new Point(Number(x), Number(y));
        }
      }
    }

    return null;
  }

  public addCardToField (card: Card, toPoint: Point): void {
    // TODO проверить нет ли на данной клетке карты
    this.applyEvent(new CardAddedToField(
      { id: card.id, x: toPoint.x, y: toPoint.y }
    ));
  }

  public moveCardToPoint (card: Card, toPoint: Point): void {
    // TODO проверить нет ли на данной клетке карты
    let fromPoint = this.getPointByCard(card);
    this.applyEvent(new CardMoved({
      id: card.id,
      toX: toPoint.x,
      toY: toPoint.y,
      fromX: fromPoint.x,
      fromY: fromPoint.y
    }));
  }

  public checkCardsAdjacency (firstCard: Card, secondCard: Card): Boolean {
    let firstCardPoint = this.getPointByCard(firstCard);
    let secondCardPoint = this.getPointByCard(secondCard);

    let xDistance = Math.abs(firstCardPoint.x - secondCardPoint.x);
    let yDistance = Math.abs(firstCardPoint.y - secondCardPoint.y);

    if (xDistance + yDistance < 2) {
      return true;
    }

    return false;
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
