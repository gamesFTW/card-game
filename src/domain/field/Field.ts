import { Card } from '../card/Card';
import { Point } from '../../infr/Point';
import { Entity } from '../../infr/Entity';
import { EntityPositions, FieldData, FieldState } from './FieldState';
import { Event } from '../../infr/Event';
import { CardEventType, FieldEventType } from '../events';
import * as lodash from 'lodash';

class Field extends Entity {
  protected state: FieldState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new FieldState(events);
  }

  public create (width: number, height: number): void {
    let id = this.generateId();

    let creatures: EntityPositions = {};

    for (let x = 1; x <= width; x++) {
      creatures[x] = {};
      let creaturesX = creatures[x];

      for (let y = 1; y <= height; y++) {
        creaturesX[y] = null;
      }
    }

    this.applyEvent(new Event<FieldData>(
      FieldEventType.FIELD_CREATED, {id, width, height, creatures}
    ));
  }

  // public getTileByPoint(point: Point): Tile {
  //   return this.tiles[point.x][point.y];
  // }

  public getPointByCreature (card: Card): Point|null {
    for (let x in this.state.creatures) {
      for (let y in this.state.creatures[x]) {
        let cardId = this.state.creatures[x][y];
        if (cardId === card.id) {
          return new Point(Number(x), Number(y));
        }
      }
    }

    return null;
  }

  public addCardToField (card: Card, toPosition: Point): void {
    let {x, y} = toPosition;

    if (x < 1 || x > this.state.width || y < 1 || y > this.state.height) {
      throw new Error('Point out of map');
    }

    if (this.state.creatures[x][y]) {
      throw new Error(`Tile x: ${x}, y: ${y} is occupied`);
    }

    let newCreatures = lodash.cloneDeep(this.state.creatures);
    newCreatures[x][y] = card.id;

    this.applyEvent(new Event<FieldData>(
      FieldEventType.CARD_ADDED_TO_FIELD,
      { creatures: newCreatures }
    ));
  }

  // public moveCardToPoint (card: Card, toPoint: Point): void {
  //   // TODO проверить нет ли на данной клетке карты
  //   let fromPoint = this.getPointByCard(card);
  //   this.applyEvent(new CardMoved({
  //     id: card.id,
  //     toX: toPoint.x,
  //     toY: toPoint.y,
  //     fromX: fromPoint.x,
  //     fromY: fromPoint.y
  //   }));
  // }

  // public checkCardsAdjacency (firstCard: Card, secondCard: Card): Boolean {
  //   let firstCardPoint = this.getPointByCard(firstCard);
  //   let secondCardPoint = this.getPointByCard(secondCard);
  //
  //   let xDistance = Math.abs(firstCardPoint.x - secondCardPoint.x);
  //   let yDistance = Math.abs(firstCardPoint.y - secondCardPoint.y);
  //
  //   if (xDistance + yDistance < 2) {
  //     return true;
  //   }
  //
  //   return false;
  // }
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
