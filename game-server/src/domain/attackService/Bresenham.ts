import { Point } from '../../infr/Point';

class Bresenham {
  static plot (point1: Point, point2: Point): Point[] {
    let x1 = point1.x;
    let y1 = point1.y;
    let x2 = point2.x;
    let y2 = point2.y;

    let xDist = Math.abs(x2 - x1);
    let yDist = -Math.abs(y2 - y1);
    let xStep = (x1 < x2 ? +1 : -1);
    let yStep = (y1 < y2 ? +1 : -1);
    let error = xDist + yDist;

    let dots = [];
    dots.push(new Point(x1, y1));

    while (x1 !== x2 || y1 !== y2) {
      if (2 * error - yDist === xDist - 2 * error) {
        error += yDist;
        x1 += xStep;
        dots.push(new Point(x1, y1));

        error += xDist;
        y1 += yStep;
        dots.push(new Point(x1, y1));
      } else if (2 * error - yDist > xDist - 2 * error) {
        error += yDist;
        x1 += xStep;
        dots.push(new Point(x1, y1));
      } else {
        error += xDist;
        y1 += yStep;
        dots.push(new Point(x1, y1));
      }
    }

    return dots;
  }
}

export default Bresenham;
