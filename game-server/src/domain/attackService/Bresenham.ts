import { Point } from '../../infr/Point';

class Bresenham {
  static plot (point1: Point, point2: Point): Point[] {
    let x0 = point1.x;
    let y0 = point1.y;
    let x1 = point2.x;
    let y1 = point2.y;

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let dots = [];

    while (true) {
      dots.push(new Point(x0, y0));

      if ((x0 === x1) && (y0 === y1)) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }

    return dots;
  }
}

export default Bresenham;
