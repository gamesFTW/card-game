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

    let units: EntityPositions = {};

    for (let x = 1; x <= width; x++) {
      units[x] = {};
      let unitsX = units[x];

      for (let y = 1; y <= height; y++) {
        unitsX[y] = null;
      }
    }

    this.applyEvent(new Event<FieldData>(
      FieldEventType.FIELD_CREATED, {id, width, height, units}
    ));
  }

  // public getTileByPoint(point: Point): Tile {
  //   return this.tiles[point.x][point.y];
  // }

  public getPositionByUnit (card: Card): Point|null {
    for (let x in this.state.units) {
      for (let y in this.state.units[x]) {
        let cardId = this.state.units[x][y];
        if (cardId === card.id) {
          return new Point(Number(x), Number(y));
        }
      }
    }

    return null;
  }

  public checkUnitsAdjacency (firstCard: Card, secondCard: Card): Boolean {
    let firstCardPoint = this.getPositionByUnit(firstCard);
    let secondCardPoint = this.getPositionByUnit(secondCard);

    let xDistance = Math.abs(firstCardPoint.x - secondCardPoint.x);
    let yDistance = Math.abs(firstCardPoint.y - secondCardPoint.y);

    if (xDistance + yDistance < 2) {
      return true;
    }

    return false;
  }

  public checkPositionsAdjacency (firstPosition: Point, secondPosition: Point): Boolean {
    let xDistance = Math.abs(firstPosition.x - secondPosition.x);
    let yDistance = Math.abs(firstPosition.y - secondPosition.y);

    if (xDistance + yDistance < 2) {
      return true;
    }

    return false;
  }

  public addCardToField (card: Card, toPosition: Point): void {
    let {x, y} = toPosition;

    if (x < 1 || x > this.state.width || y < 1 || y > this.state.height) {
      throw new Error('Point out of map');
    }

    this.checkPositionForVacancy(toPosition);

    let newUnits = lodash.cloneDeep(this.state.units);
    newUnits[x][y] = card.id;

    this.applyEvent(new Event<FieldData>(
      FieldEventType.CARD_MOVED,
      { units: newUnits }
    ));
  }

  public moveUnit (card: Card, toPosition: Point): void {
    this.checkPositionForVacancy(toPosition);

    let fromPosition = this.getPositionByUnit(card);

    if (!this.checkPositionsAdjacency(fromPosition, toPosition)) {
      throw new Error(`Card ${card.id} is not adjacent to ${toPosition}`);
    }

    let newUnits = lodash.cloneDeep(this.state.units);

    newUnits[fromPosition.x][fromPosition.y] = null;
    newUnits[toPosition.x][toPosition.y] = card.id;

    this.applyEvent(new Event<FieldData>(
      FieldEventType.CARD_MOVED,
      { units: newUnits }
    ));
  }

  private checkPositionForVacancy (toPosition: Point): void {
    let {x, y} = toPosition;

    if (this.state.units[x][y]) {
      throw new Error(`Tile x: ${x}, y: ${y} is occupied`);
    }
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
