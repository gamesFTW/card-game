import * as lodash from 'lodash';
import { Grid } from 'pathfinding';

import { Card } from '../card/Card';
import { Point } from '../../infr/Point';
import { Entity, EntityId } from '../../infr/Entity';
import { BoardObjects, BoardData, BoardState } from './BoardState';
import { Event } from '../../infr/Event';
import { BoardEventType, BoardCardMovedExtra } from '../events';
import { Player, CardStack } from '../player/Player';
import { calcDistance } from './Path/Path.helpers';
import { findPath } from './Path/Path';
import { Area } from '../area/Area';

type BoardObject = Card|Area;

class Board extends Entity {
  get areas (): Array<EntityId> { return this.state.areas; }

  protected state: BoardState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new BoardState(events);
  }

  public create (width: number, height: number): void {
    let id = this.generateId();

    let units: BoardObjects = {};

    for (let x = 1; x <= width; x++) {
      units[x] = {};
      let unitsX = units[x];

      for (let y = 1; y <= height; y++) {
        unitsX[y] = null;
      }
    }

    this.applyEvent(new Event<BoardData>(
      BoardEventType.BOARD_CREATED, {id, width, height, boardObjects: units}
    ));
  }

  public getPositionByBoardObject (boardObject: BoardObject): Point|null {
    for (let x in this.state.boardObjects) {
      for (let y in this.state.boardObjects[x]) {
        let cardId = this.state.boardObjects[x][y];
        if (cardId === boardObject.id) {
          return new Point(Number(x), Number(y));
        }
      }
    }

    return null;
  }

  public getBoardObjectIdByPosition (position: Point): EntityId {
    if (this.state.boardObjects[position.x] && this.state.boardObjects[position.x][position.y]) {
      return this.state.boardObjects[position.x][position.y];
    }

    return null;
  }

  public checkUnitsAdjacency (firstCard: Card, secondCard: Card): boolean {
    let firstCardPoint = this.getPositionByBoardObject(firstCard);
    let secondCardPoint = this.getPositionByBoardObject(secondCard);

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

  public addUnitOnBoard (unit: Card, toPosition: Point): void {
    let newBoardObjects = this.createBoardObjectWith(unit, toPosition);

    this.applyEvent(new Event<BoardData>(
      BoardEventType.BOARD_OBJECT_ADDED_TO_BOARD,
      {
        boardObjects: newBoardObjects
      }
    ));
  }

  public addAreaOnBoard (area: Area, toPosition: Point): void {
    let newBoardObjects = this.createBoardObjectWith(area, toPosition);

    let newAreas = lodash.clone(this.state.areas);
    newAreas.push(area.id);

    this.applyEvent(new Event<BoardData>(
      BoardEventType.BOARD_OBJECT_ADDED_TO_BOARD,
      {
        boardObjects: newBoardObjects,
        areas: newAreas
      }
    ));
  }

  public createBoardObjectWith (boardObject: BoardObject, toPosition: Point): BoardObjects {
    let {x, y} = toPosition;

    if (x < 1 || x > this.state.width || y < 1 || y > this.state.height) {
      throw new Error('Point out of map');
    }

    this.checkPositionForVacancy(toPosition);

    let newBoardObjects = lodash.cloneDeep(this.state.boardObjects);
    newBoardObjects[x][y] = boardObject.id;

    return newBoardObjects;
  }

  public removeUnitFromBoard (card: Card): void {
    let position = this.getPositionByBoardObject(card);
    let newUnits = lodash.cloneDeep(this.state.boardObjects);

    newUnits[position.x][position.y] = null;

    this.applyEvent(new Event<BoardData>(
      BoardEventType.CARD_REMOVED,
      { boardObjects: newUnits }
    ));
  }

  public moveUnit (card: Card, toPosition: Point, areas: Area[]): void {
    this.checkPositionForMovement(toPosition, areas);

    const fromPosition = this.getPositionByBoardObject(card);

    const newUnits = lodash.cloneDeep(this.state.boardObjects);
    newUnits[fromPosition.x][fromPosition.y] = null;
    newUnits[toPosition.x][toPosition.y] = card.id;

    this.applyEvent(new Event<BoardData, BoardCardMovedExtra>(
      BoardEventType.CARD_MOVED,
      { boardObjects: newUnits },
      { toPosition: toPosition, movedCardId: card.id }
    ));
  }

  public getPathOfUnitMove (card: Card, toPosition: Point, opponent: Player, areas: Area[]): Point[] {
    this.checkPositionForMovement(toPosition, areas);

    const fromPosition = this.getPositionByBoardObject(card);

    const grid = this.getPFGridWithEnemies(opponent, areas);
    return findPath(fromPosition, toPosition, grid);
  }

  public checkIsPositionAdjacentToCards (position: Point, cards: Card[]): boolean {
    let isAdjacent = false;
    for (let card of cards) {
      let cardPosition = this.getPositionByBoardObject(card);
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
    let firstCardPosition: Point = this.getPositionByBoardObject(firstCard);
    let secondCardPosition: Point = this.getPositionByBoardObject(secondCard);

    let candidateX = secondCardPosition.x + (secondCardPosition.x - firstCardPosition.x);
    let candidateY = secondCardPosition.y + (secondCardPosition.y - firstCardPosition.y);

    let candidatePosition: Point = new Point(candidateX, candidateY);
    return this.getBoardObjectIdByPosition(candidatePosition);
  }

  private getPFGrid (): Grid {
    return new Grid(this.state.width + 1, this.state.height + 1);
  }

  private getPFGridWithEnemies (opponent: Player, areas: Area[]): Grid {
    const grid = this.getPFGrid();

    for (let x in this.state.boardObjects) {
      for (let y in this.state.boardObjects[x]) {
        let boardObject = this.state.boardObjects[x][y];

        let area = this.getAreaFromAreas(boardObject, areas);
        if (area) {
          grid.setWalkableAt(Number(x), Number(y), area.canUnitsWalkThoughtIt);
        } else {
          let cardId = this.state.boardObjects[x][y];

          if (opponent.checkCardIdIn(cardId, CardStack.TABLE)) {
            grid.setWalkableAt(Number(x), Number(y), false);
          }
        }
      }
    }

    return grid;
  }

  private checkPositionForMovement (toPosition: Point, areas: Area[]): void {
    let {x, y} = toPosition;

    let boardObjectId = this.state.boardObjects[x][y];

    if (boardObjectId) {
      let area = this.getAreaFromAreas(boardObjectId, areas);
      if (!area || !area.canUnitsWalkThoughtIt) {
        throw new Error(`Tile x: ${x}, y: ${y} is occupied`);
      }
    }
  }

  private checkPositionForVacancy (toPosition: Point): void {
    let {x, y} = toPosition;

    if (this.state.boardObjects[x][y]) {
      throw new Error(`Tile x: ${x}, y: ${y} is occupied`);
    }
  }

  private getAreaFromAreas (areaId: EntityId, areas: Area[]): Area {
    for (let a of areas) {
      if (a.id === areaId) {
        return a;
      }
    }

    return null;
  }
}

export {Board};
