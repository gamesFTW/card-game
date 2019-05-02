import { Grid } from 'pathfinding';
import { findPath } from './Path';
import { Point } from '../../../infr/Point';

export function canGoInRange (from: Point, to: Point, range: number, grid: Grid): boolean {
  const path = findPath(from, to, grid);
  if (path.length === 0) {
    return false;
  }

  if (path.length <= range) {
    return true;
  }

  return false;
}
