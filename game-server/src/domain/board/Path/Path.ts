import { Grid, AStarFinder, DiagonalMovement } from 'pathfinding';
import { Point } from '../../../infr/Point';

export function findPath (from: Point, to: Point, grid: Grid): Point[] {
  const finder = new AStarFinder({
    diagonalMovement: DiagonalMovement.Never
  });

  return pathToPoints(finder.findPath(from.x, from.y, to.x, to.y, grid));
}

export function pathToPoints (path: number[][]): Point[] {
  return path.map(([x, y]) => new Point(x, y));
}
