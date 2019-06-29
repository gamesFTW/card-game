import { Point } from '../../infr/Point';

class Bresenham {
  static plot (point1: Point, point2: Point): Point[] {
    let x1 = point1.x;
    let y1 = point1.y;
    let x2 = point2.x;
    let y2 = point2.y;

    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    let dots = [];

    while (true) {
      dots.push(new Point(x1, y1));

      if ((x1 === x2) && (y1 === y2)) break;
      let e2 = 2 * err;
      if (e2 > -dy && e2 < dx) {
        dots.push(new Point(x1 + sx, y1));
        dots.push(new Point(x1, y1 + sy));
      }
      if (e2 > -dy) { err -= dy; x1 += sx; }
      if (e2 < dx) { err += dx; y1 += sy; }
    }

    return dots;
  }
}

export default Bresenham;
