import { Point } from '../../infr/Point';

class Bresenham {
  static plot (point1: Point, point2: Point): Point[] {
    let x1 = point1.x;
    let y1 = point1.y;
    let x2 = point2.x;
    let y2 = point2.y;

    let xDist = Math.abs(x2 - x1);
    let yDist = Math.abs(y2 - y1);
    let xStep = (x1 < x2 ? +1 : -1);
    let yStep = (y1 < y2 ? +1 : -1);

    let maxDist = xDist > yDist ? xDist : yDist;
    let minDist = xDist > yDist ? yDist : xDist;

    let dots = [];

    let a = minDist / maxDist;
    let inc = 0;

    for (let i = 0; i <= maxDist; i++) {
      if (xDist > yDist) {
        let x = x1 + (xStep * i);
        let y = y1 + (inc * yStep);

        if (Number.isInteger(inc)) {
          dots.push(new Point(x, Math.round(y)));
        } else {
          dots.push(new Point(x, Math.floor(y)));
          dots.push(new Point(x, Math.ceil(y)));
        }
      }
      if (xDist < yDist) {
        let x = x1 + (inc * xStep);
        let y = y1 + (yStep * i);

        if (Number.isInteger(inc)) {
          dots.push(new Point(Math.round(x), y));
        } else {
          dots.push(new Point(Math.floor(x), y));
          dots.push(new Point(Math.ceil(x), y));
        }
      }
      if (xDist === yDist) {
        let x = x1 + (xStep * i);
        let y = y1 + (yStep * i);

        dots.push(new Point(x, y));

        if (i !== maxDist) {
          dots.push(new Point(x + xStep, y));
          dots.push(new Point(x, y + yStep));
        }
      }

      inc += a;
    }

    return dots;
  }

  static plot2 (point1: Point, point2: Point): Point[] {
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
        dots.push(new Point(x1, y1 + yStep));

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
