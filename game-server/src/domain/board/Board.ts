import * as lodash from 'lodash';
import { Grid, AStarFinder } from 'pathfinding';

import { Card } from '../card/Card';
import { Point } from '../../infr/Point';
import { Entity, EntityId } from '../../infr/Entity';
import { EntityPositions, BoardData, BoardState } from './BoardState';
import { Event } from '../../infr/Event';
import { CardEventType, BoardEventType, CardMovedExtra, BoardCardMovedExtra } from '../events';
import { Player, CardStack } from '../player/Player';
import { calcDistance, canGoInRange } from './Path/Path.helpers';
import { pathToPoints, findPath } from './Path/Path';

class Board extends Entity {
  protected state: BoardState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new BoardState(events);
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

    this.applyEvent(new Event<BoardData>(
      BoardEventType.BOARD_CREATED, {id, width, height, units}
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

  public getCardIdByPosition (position: Point): EntityId {
    if (this.state.units[position.x] && this.state.units[position.x][position.y]) {
      return this.state.units[position.x][position.y];
    }

    return null;
  }

  public checkUnitsAdjacency (firstCard: Card, secondCard: Card): boolean {
    let firstCardPoint = this.getPositionByUnit(firstCard);
    let secondCardPoint = this.getPositionByUnit(secondCard);

    let xDistance = Math.abs(firstCardPoint.x - secondCardPoint.x);
    let yDistance = Math.abs(firstCardPoint.y - secondCardPoint.y);

    if (xDistance + yDistance < 2) {
      return true;
    }

    return false;
  }

  public checkPositionsAdjacency (firstPosition: Point, secondPosition: Point): boolean {
    let xDistance = Math.abs(firstPosition.x - secondPosition.x);
    let yDistance = Math.abs(firstPosition.y - secondPosition.y);

    if (xDistance + yDistance < 2) {
      return true;
    }

    return false;
  }

  public addUnitOnBoard (card: Card, toPosition: Point): void {
    let {x, y} = toPosition;

    if (x < 1 || x > this.state.width || y < 1 || y > this.state.height) {
      throw new Error('Point out of map');
    }

    this.checkPositionForVacancy(toPosition);

    let newUnits = lodash.cloneDeep(this.state.units);
    newUnits[x][y] = card.id;

    this.applyEvent(new Event<BoardData>(
      BoardEventType.CARD_ADDED_TO_BOARD,
      { units: newUnits }
    ));
  }

  public removeUnitFromBoard (card: Card): void {
    let position = this.getPositionByUnit(card);
    let newUnits = lodash.cloneDeep(this.state.units);

    newUnits[position.x][position.y] = null;

    this.applyEvent(new Event<BoardData>(
      BoardEventType.CARD_REMOVED,
      { units: newUnits }
    ));
  }

  public moveUnit (card: Card, toPosition: Point): void {
    this.checkPositionForVacancy(toPosition);

    const fromPosition = this.getPositionByUnit(card);

    const newUnits = lodash.cloneDeep(this.state.units);
    newUnits[fromPosition.x][fromPosition.y] = null;
    newUnits[toPosition.x][toPosition.y] = card.id;

    this.applyEvent(new Event<BoardData, BoardCardMovedExtra>(
      BoardEventType.CARD_MOVED,
      { units: newUnits },
      { toPosition: toPosition, movedCardId: card.id }
    ));
  }

  public getPathOfUnitMove (card: Card, toPosition: Point, opponent: Player): Point[] {
    this.checkPositionForVacancy(toPosition);

    const fromPosition = this.getPositionByUnit(card);

    const grid = this.getPFGridWithEnemies(opponent);
    return findPath(fromPosition, toPosition, grid);
  }

  public checkIsPositionAdjacentToCards (position: Point, cards: Card[]): boolean {
    let isAdjacent = false;
    for (let card of cards) {
      let cardPosition = this.getPositionByUnit(card);
      isAdjacent = this.checkPositionsAdjacency(position, cardPosition);

      if (isAdjacent) {
        return true;
      }
    }

    return isAdjacent;
  }

  public getDistanceBetweenPositions (position1: Point, position2: Point): number {
    return calcDistance(position1, position2);
  }

  public getCardIdBehindSecondCard (firstCard: Card, secondCard: Card): string {
    let firstCardPosition: Point = this.getPositionByUnit(firstCard);
    let secondCardPosition: Point = this.getPositionByUnit(secondCard);

    let candidateX = secondCardPosition.x + (secondCardPosition.x - firstCardPosition.x);
    let candidateY = secondCardPosition.y + (secondCardPosition.y - firstCardPosition.y);

    let candidatePosition: Point = new Point(candidateX, candidateY);
    return this.getCardIdByPosition(candidatePosition);
  }

  private getPFGrid (): Grid {
    return new Grid(this.state.width + 1, this.state.height + 1);
  }

  private getPFGridWithEnemies (opponent: Player): Grid {
    const grid = this.getPFGrid();

    for (let x in this.state.units) {
      for (let y in this.state.units[x]) {
        let cardId = this.state.units[x][y];
        if (opponent.checkCardIdIn(cardId, CardStack.TABLE)) {
          grid.setWalkableAt(Number(x), Number(y), false);
        }
      }
    }

    return grid;
  }

  private checkPositionForVacancy (toPosition: Point): void {
    let {x, y} = toPosition;

    if (this.state.units[x][y]) {
      throw new Error(`Tile x: ${x}, y: ${y} is occupied`);
    }
  }
}

export {Board};
