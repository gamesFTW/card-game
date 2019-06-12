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
import { DomainError } from '../../infr/DomainError';

type BoardObject = Card|Area;

class Board extends Entity {
  get areas (): Array<EntityId> {
    let areas = [];
    for (let x in this.state.areas) {
      for (let y in this.state.areas[x]) {
        let areaId = this.state.areas[x][y];

        if (areaId) {
          areas.push(areaId);
        }
      }
    }

    return areas;
  }

  protected state: BoardState;

  constructor (events: Array<Event> = []) {
    super();
    this.state = new BoardState(events);
  }

  public create (width: number, height: number): void {
    let id = this.generateId();

    let units: BoardObjects = {};
    let areas: BoardObjects = {};

    for (let x = 1; x <= width; x++) {
      units[x] = {};
      areas[x] = {};
      let unitsX = units[x];
      let areasX = areas[x];

      for (let y = 1; y <= height; y++) {
        unitsX[y] = null;
        areasX[y] = null;
      }
    }

    this.applyEvent(new Event<BoardData>(
      BoardEventType.BOARD_CREATED, {id, width, height, units, areas}
    ));
  }

  public getPositionOfUnit (unit: Card): Point|null {
    return this.getPositionOfBoardObject(unit, this.state.units);
  }

  public getPositionOfArea (area: Area): Point|null {
    return this.getPositionOfBoardObject(area, this.state.areas);
  }

  public getUnitIdByPosition (position: Point): EntityId {
    return this.getBoardObjectIdByPosition(position, this.state.units);
  }

  public getAreaIdByPosition (position: Point): EntityId {
    return this.getBoardObjectIdByPosition(position, this.state.areas);
  }

  public getBoardObjectIdByPosition (position: Point, boardObjects: BoardObjects): EntityId {
    if (boardObjects[position.x] && boardObjects[position.x][position.y]) {
      return boardObjects[position.x][position.y];
    }

    return null;
  }

  public checkUnitsAdjacency (firstCard: Card, secondCard: Card): boolean {
    let firstCardPoint = this.getPositionOfUnit(firstCard);
    let secondCardPoint = this.getPositionOfUnit(secondCard);

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

  public addUnitOnBoard (unit: Card, toPosition: Point, areas: Area[]): void {
    this.checkPositionCanBeOccupiedByUnit(toPosition, areas);

    let newBoardObjects = this.createBoardObjectWith(unit, toPosition, this.state.units);

    this.applyEvent(new Event<BoardData>(
      BoardEventType.BOARD_OBJECT_ADDED_TO_BOARD,
      {
        units: newBoardObjects
      }
    ));
  }

  public addAreaOnBoard (area: Area, toPosition: Point): void {
    let newBoardObjects = this.createBoardObjectWith(area, toPosition, this.state.areas);

    this.applyEvent(new Event<BoardData>(
      BoardEventType.BOARD_OBJECT_ADDED_TO_BOARD,
      {
        areas: newBoardObjects
      }
    ));
  }

  public removeUnitFromBoard (card: Card): void {
    let position = this.getPositionOfUnit(card);
    let newUnits = lodash.cloneDeep(this.state.units);

    newUnits[position.x][position.y] = null;

    this.applyEvent(new Event<BoardData>(
      BoardEventType.CARD_REMOVED,
      { units: newUnits }
    ));
  }

  public moveUnit (card: Card, toPosition: Point, areas: Area[]): void {
    this.checkPositionCanBeOccupiedByUnit(toPosition, areas);

    const fromPosition = this.getPositionOfUnit(card);

    const newUnits = lodash.cloneDeep(this.state.units);
    newUnits[fromPosition.x][fromPosition.y] = null;
    newUnits[toPosition.x][toPosition.y] = card.id;

    this.applyEvent(new Event<BoardData, BoardCardMovedExtra>(
      BoardEventType.CARD_MOVED,
      { units: newUnits },
      { toPosition: toPosition, movedCardId: card.id }
    ));
  }

  public getPathOfUnitMove (card: Card, toPosition: Point, opponent: Player, areas: Area[]): Point[] {
    this.checkPositionCanBeOccupiedByUnit(toPosition, areas);

    const fromPosition = this.getPositionOfUnit(card);

    const grid = this.getPFGridWithEnemies(opponent, areas);
    return findPath(fromPosition, toPosition, grid);
  }

  public checkIsPositionAdjacentToCards (position: Point, cards: Card[]): boolean {
    let isAdjacent = false;
    for (let card of cards) {
      let cardPosition = this.getPositionOfUnit(card);
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
    let firstCardPosition: Point = this.getPositionOfUnit(firstCard);
    let secondCardPosition: Point = this.getPositionOfUnit(secondCard);

    let candidateX = secondCardPosition.x + (secondCardPosition.x - firstCardPosition.x);
    let candidateY = secondCardPosition.y + (secondCardPosition.y - firstCardPosition.y);

    let candidatePosition: Point = new Point(candidateX, candidateY);
    return this.getUnitIdByPosition(candidatePosition);
  }

  private getPositionOfBoardObject (boardObject: BoardObject, boardObjects: BoardObjects): Point|null {
    for (let x in boardObjects) {
      for (let y in boardObjects[x]) {
        let boardObjectId = boardObjects[x][y];
        if (boardObjectId === boardObject.id) {
          return new Point(Number(x), Number(y));
        }
      }
    }

    return null;
  }

  private createBoardObjectWith (boardObject: BoardObject, toPosition: Point, boardObjects: BoardObjects): BoardObjects {
    let {x, y} = toPosition;

    if (x < 1 || x > this.state.width || y < 1 || y > this.state.height) {
      throw new DomainError('Point out of map');
    }

    let newBoardObjects = lodash.cloneDeep(boardObjects);
    newBoardObjects[x][y] = boardObject.id;

    return newBoardObjects;
  }

  private getPFGrid (): Grid {
    return new Grid(this.state.width + 1, this.state.height + 1);
  }

  private getPFGridWithEnemies (opponent: Player, areas: Area[]): Grid {
    const grid = this.getPFGrid();

    for (let x in this.state.units) {
      for (let y in this.state.units[x]) {
        let areaId = this.state.areas[x][y];

        let area = this.getAreaFromAreas(areaId, areas);
        if (area) {
          grid.setWalkableAt(Number(x), Number(y), area.canUnitsWalkThoughtIt);
        } else {
          let cardId = this.state.units[x][y];

          if (opponent.checkCardIdIn(cardId, CardStack.TABLE)) {
            grid.setWalkableAt(Number(x), Number(y), false);
          }
        }
      }
    }

    return grid;
  }

  private checkPositionCanBeOccupiedByUnit (toPosition: Point, areas: Area[]): void {
    let {x, y} = toPosition;

    if (x > this.state.width || x <= 0) {
      throw new DomainError(`Tile x: ${x}, y: ${y} is not on the board`);
    }

    if (y > this.state.height || y <= 0) {
      throw new DomainError(`Tile x: ${x}, y: ${y} is not on the board`);
    }

    if (this.state.units[x][y]) {
      throw new DomainError(`Tile x: ${x}, y: ${y} is occupied`);
    }

    const areaId = this.state.areas[x][y];
    if (areaId) {
      const area = this.getAreaFromAreas(areaId, areas);
      if (!area.canUnitsWalkThoughtIt) {
        throw new DomainError(`Tile x: ${x}, y: ${y} is occupied`);
      }
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
