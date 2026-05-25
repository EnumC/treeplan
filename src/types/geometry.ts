export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Convert a clientX/clientY (pointer event coords) to world feet.
 *
 * The SVG viewBox is in paper inches. The drawing area group inside has a
 * transform: translate(drawingOriginX, drawingOriginY) scale(1/worldUnitsPerInch).
 * We must invert that transform to get world feet.
 */
export function clientToWorld(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  drawingOriginInchX: number,
  drawingOriginInchY: number,
  worldUnitsPerInch: number
): Point {
  const pt = new DOMPoint(clientX, clientY);
  const ctm = svg.getScreenCTM();
  if (!ctm) throw new Error('SVG not mounted');
  const inPaperInches = pt.matrixTransform(ctm.inverse());
  // Invert the drawing-area group transform
  const wx = (inPaperInches.x - drawingOriginInchX) * worldUnitsPerInch;
  const wy = (inPaperInches.y - drawingOriginInchY) * worldUnitsPerInch;
  return { x: wx, y: wy };
}

/**
 * Axis-aligned bounding rect of a rotated rectangle.
 * rect: { x, y, w, h } where (x,y) is the top-left corner.
 */
export function rotatedBounds(rect: Rect, rotationDeg: number): Rect {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const newW = rect.w * cos + rect.h * sin;
  const newH = rect.w * sin + rect.h * cos;
  return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
}

/**
 * Returns the four corners of a rotated rectangle, in world coords.
 * rect: { x, y, w, h } where (x,y) is the top-left corner.
 */
export function rotatedCorners(rect: Rect, rotationDeg: number): Point[] {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = rect.w / 2;
  const hh = rect.h / 2;
  const corners = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];
  return corners.map((c) => ({
    x: cx + c.x * cos - c.y * sin,
    y: cy + c.x * sin + c.y * cos,
  }));
}

/** Does point lie inside this rotated rectangle? */
export function pointInRotatedRect(
  p: Point,
  rect: Rect,
  rotationDeg: number
): boolean {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const rad = (-rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // Transform point to local frame
  const lx = cos * (p.x - cx) - sin * (p.y - cy);
  const ly = sin * (p.x - cx) + cos * (p.y - cy);
  return (
    lx >= -rect.w / 2 &&
    lx <= rect.w / 2 &&
    ly >= -rect.h / 2 &&
    ly <= rect.h / 2
  );
}

/**
 * SAT overlap test for two convex polygons.
 * Returns true if they overlap.
 */
function satOverlap(poly1: Point[], poly2: Point[]): boolean {
  const polys = [poly1, poly2];
  for (const poly of polys) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!;
      const b = poly[(i + 1) % poly.length]!;
      const axis = { x: -(b.y - a.y), y: b.x - a.x };
      let min1 = Infinity;
      let max1 = -Infinity;
      let min2 = Infinity;
      let max2 = -Infinity;
      for (const p of poly1) {
        const proj = p.x * axis.x + p.y * axis.y;
        if (proj < min1) min1 = proj;
        if (proj > max1) max1 = proj;
      }
      for (const p of poly2) {
        const proj = p.x * axis.x + p.y * axis.y;
        if (proj < min2) min2 = proj;
        if (proj > max2) max2 = proj;
      }
      if (max1 < min2 || max2 < min1) return false;
    }
  }
  return true;
}

/** Does this marquee rect intersect this element's rotated bounds using SAT? */
export function marqueeIntersects(
  marquee: Rect,
  elementBounds: Rect,
  elementRotation: number
): boolean {
  const mqCorners = rotatedCorners(marquee, 0);
  const elCorners = rotatedCorners(elementBounds, elementRotation);
  return satOverlap(mqCorners, elCorners);
}
