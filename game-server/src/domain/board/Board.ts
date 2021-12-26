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
import { ReachChecker } from './Path/ReachChecker';
import {
  RangeAttackService,
  UnitCantReachUnitInRangeAttack, UnitCantShootToUnitBecauseOfCardOnPath,
  UnitToCloseToUnitInRangeAttack
} from '../attackService/RangeAttackService';

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

  public calcDistanceBetweenUnits (firstCard: Card, secondCard: Card): number {
    let firstCardPoint = this.getPositionOfUnit(firstCard);
    let secondCardPoint = this.getPositionOfUnit(secondCard);

    let xDistance = Math.abs(firstCardPoint.x - secondCardPoint.x);
    let yDistance = Math.abs(firstCardPoint.y - secondCardPoint.y);

    return xDistance + yDistance;
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

  public getCardIdBehindSecondCard (firstCard: Card, secondCard: Card): EntityId {
    let firstCardPosition: Point = this.getPositionOfUnit(firstCard);
    let secondCardPosition: Point = this.getPositionOfUnit(secondCard);

    let candidateX = secondCardPosition.x + (secondCardPosition.x - firstCardPosition.x);
    let candidateY = secondCardPosition.y + (secondCardPosition.y - firstCardPosition.y);

    let candidatePosition: Point = new Point(candidateX, candidateY);
    return this.getUnitIdByPosition(candidatePosition);
  }

  public getEnemiesForRangeAttackOfCard(card: Card, enemyUnits: Card[], areas: Area[]): Card[] {
    const cardPosition = this.getPositionOfUnit(card);
    const pointsInRadius = this.findPointsInRadius(
      cardPosition, card.abilities.range.range, card.abilities.range.minRange
    );

    const enemiesInRadius = [];
    for (let point of pointsInRadius) {
      let cardId = this.getUnitIdByPosition(point);

      if (cardId) {
        for (let enemyCard of enemyUnits) {
          if (cardId === enemyCard.id) {
            enemiesInRadius.push(enemyCard);
          }
        }
      }
    }

    const enemiesForRangeAttack = [];
    for (let enemyCard of enemiesInRadius) {
      let canAttack = false;

      try {
        canAttack = RangeAttackService.checkCanRangeAttackTo(card, enemyCard, this, enemyUnits, areas);
      }
      catch(error) {
        if (
          error instanceof UnitCantReachUnitInRangeAttack ||
          error instanceof UnitToCloseToUnitInRangeAttack ||
          error instanceof UnitCantShootToUnitBecauseOfCardOnPath
        ) {
          canAttack = false;
        } else {
          throw error;
        }
      }

      if (canAttack) {
        enemiesForRangeAttack.push(enemyCard);
      }
    }

    return enemiesForRangeAttack;
  }

  public getEnemiesAroundOfUnit(card: Card, enemyUnits: Card[]) {
    const position = this.getPositionOfUnit(card);
    const nearbyPositions = this.findPointsInRadius(position, 1, 0);
    const targets = [];

    for (let position of nearbyPositions) {
      let nearbyUnitId = this.getUnitIdByPosition(position);
      if (nearbyUnitId) {
        let nearbyUnit = enemyUnits.find((unit: Card) => unit.id === nearbyUnitId);
        if (nearbyUnit) {
          targets.push(nearbyUnit);
        }
      }
    }

    return targets;
  }

  public findPointsInRadius (center: Point, radius: number, minRadius: number = 1): Point[] {
    let pointsInRadius: Point[] = [];

    if (minRadius === 1) {
      pointsInRadius.push(center);
    }

    for (let x = 1; x <= this.state.width; x++) {
      let rangeX = Math.abs(center.x - x);

      if (rangeX <= radius) {
        for (let y = 1; y <= this.state.height; y++) {
          if (!(center.x === x && center.y === y)) {
            let rangeY = Math.abs(center.y - y);

            if ((rangeY + rangeX) <= radius && (rangeY + rangeX) >= minRadius) {
              pointsInRadius.push(new Point(x, y));
            }
          }
        }
      }
    }

    return pointsInRadius;
  }

  public findPointsInSquareRadius (center: Point, radius: number): Point[] {
    let pointsInRadius: Point[] = [];

    pointsInRadius.push(center);

    for (let x = 1; x <= this.state.width; x++) {
      let rangeX = Math.abs(center.x - x);

      if (rangeX <= radius) {
        for (let y = 1; y <= this.state.height; y++) {
          if (!(center.x === x && center.y === y)) {
            let rangeY = Math.abs(center.y - y);

            if (rangeX <= radius && rangeY <= radius) {
              pointsInRadius.push(new Point(x, y));
            }
          }
        }
      }
    }

    return pointsInRadius;
  }

  public findPointToMove (
    movedCard: Card, targetCard: Card, areas: Area[], movedCardPlayerTableCards: Card[], targetCardPlayerTableCards: Card[]
  ): Point {
    const targetCardPosition = this.getPositionOfUnit(targetCard);

    const points = this.findUnitReach(movedCard, areas, movedCardPlayerTableCards, targetCardPlayerTableCards);

    for (let point of points) {
      if (this.checkPositionsAdjacency(point, targetCardPosition)) {
        return point;
      }
    }

    return null;
  }

  public findUnitReach (card: Card, areas: Area[], unitAllays: Card[], unitOpponents: Card[]): Point[] {
    const cardPosition = this.getPositionOfUnit(card);

    const reachChecker = this.createReachChecker(areas, unitAllays, unitOpponents);
    return reachChecker.checkReach(cardPosition, card.currentMovingPoints);
  }

  public drawBoard(): void {
    let canvas = "";

    for (let x = 1; x <= this.state.width; x++) {
      for (let y = 1; y <= this.state.height; y++) {
        let areaId = this.state.areas[x][y];
        let unitId = this.state.units[x][y];

        if (unitId) {
          canvas = canvas + "U";
        } else if (areaId) {
          canvas = canvas + "A";
        } else {
          canvas = canvas + " ";
        }
      }

      canvas = canvas + "\n";
    }

    console.log(canvas);
  }

  private createReachChecker (
    areas: Area[],
    playerCards: Card[],
    opponentCards: Card[],
    isCanWalkThroughArea: boolean = false,
    isCanWalkThroughEnemy: boolean = false,
    isCanWalkThroughAlly: boolean = true
  ): ReachChecker {
    const reachChecker = new ReachChecker(this.state.width, this.state.height);

    for (let x in this.state.units) {
      for (let y in this.state.units[x]) {
        let areaId = this.state.areas[x][y];

        let area = this.getEntityFromArray<Area>(areaId, areas);
        if (area && !area.canUnitsWalkThoughtIt) {
          reachChecker.addBlocker(new Point(Number(x), Number(y)), isCanWalkThroughArea);
        } else {
          let cardId = this.state.units[x][y];

          let playerCard = this.getEntityFromArray<Card>(cardId, playerCards);
          let opponentCard = this.getEntityFromArray<Card>(cardId, opponentCards);

          if (playerCard) {
            reachChecker.addBlocker(new Point(Number(x), Number(y)), isCanWalkThroughAlly);
          }

          if (opponentCard) {
            reachChecker.addBlocker(new Point(Number(x), Number(y)), isCanWalkThroughEnemy);
          }
        }
      }
    }

    return reachChecker;
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

        let area = this.getEntityFromArray<Area>(areaId, areas);
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
      const area = this.getEntityFromArray<Area>(areaId, areas);
      if (!area.canUnitsWalkThoughtIt) {
        throw new DomainError(`Tile x: ${x}, y: ${y} is occupied`);
      }
    }
  }

  private getEntityFromArray<T extends Entity> (id: EntityId, entities: T[]): T {
    for (let e of entities) {
      if (e.id === id) {
        return e;
      }
    }

    return null;
  }
}

export {Board};
