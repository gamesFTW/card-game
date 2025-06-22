import { Grid } from 'pathfinding';
import { findPath } from './Path';
import { Point } from '../../../infr/Point';

function canGoInRange (from: Point, to: Point, range: number, grid: Grid): boolean {
  const path = findPath(from, to, grid);
  if (path.length === 0) {
    return false;
  }

  if (path.length <= range) {
    return true;
  }

  return false;
}

function calcDistance (from: Point, to: Point): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

export {canGoInRange, calcDistance};
