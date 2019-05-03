import { Point } from '../../infr/Point';

class Bresenham {
  static plot (point1: Point, point2: Point): Point[] {
    let dots = [];
    let dx = Math.abs(point2.x - point1.x);
    let dy = Math.abs(point2.y - point1.y);
    let sx = (point1.x < point2.x) ? 1 : -1;
    let sy = (point1.y < point2.y) ? 1 : -1;
    let err = dx - dy;

    let x = point1.x;
    let y = point1.y;

    dots.push(new Point(point1.x, point1.y));

    while (!((point1.x === point2.x) && (point1.y === point2.y))) {
      let e2 = err << 1;

      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }

      if (e2 < dx) {
        err += dx;
        y += sy;
      }

      dots.push(new Point(x, y));
    }

    return dots;
  }
}

export default Bresenham;
