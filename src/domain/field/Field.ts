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

  public getPositionByCreature (card: Card): Point|null {
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

  public checkCreaturesAdjacency (firstCard: Card, secondCard: Card): Boolean {
    let firstCardPoint = this.getPositionByCreature(firstCard);
    let secondCardPoint = this.getPositionByCreature(secondCard);

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

    let newCreatures = lodash.cloneDeep(this.state.creatures);
    newCreatures[x][y] = card.id;

    this.applyEvent(new Event<FieldData>(
      FieldEventType.CARD_MOVED,
      { creatures: newCreatures }
    ));
  }

  public moveCreature (card: Card, toPosition: Point): void {
    this.checkPositionForVacancy(toPosition);

    let fromPosition = this.getPositionByCreature(card);

    if (!this.checkPositionsAdjacency(fromPosition, toPosition)) {
      throw new Error(`Card ${card.id} is not adjacent to ${toPosition}`);
    }

    let newCreatures = lodash.cloneDeep(this.state.creatures);

    newCreatures[fromPosition.x][fromPosition.y] = null;
    newCreatures[toPosition.x][toPosition.y] = card.id;

    this.applyEvent(new Event<FieldData>(
      FieldEventType.CARD_MOVED,
      { creatures: newCreatures }
    ));
  }

  private checkPositionForVacancy (toPosition: Point): void {
    let {x, y} = toPosition;

    if (this.state.creatures[x][y]) {
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
