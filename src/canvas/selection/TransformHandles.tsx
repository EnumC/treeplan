import type React from 'react';
import type { SiteElement } from '@/types/document';
import { isBox, isTree, isText, isPoly, isDimension } from '@/types/document';
import type { HandleId } from './useTransformController';

interface Props {
  el: SiteElement;
  onResizeStart: (e: React.PointerEvent, handle: HandleId) => void;
  onRotateStart: (e: React.PointerEvent) => void;
}

// 1.8 world-feet = 0.18 paper-inches ≈ 7-8 px at default zoom. vectorEffect keeps
// the stroke weight constant but the rect itself scales with the drawing; this size
// feels like a standard CAD handle at the default 1"=10' scale.
const HANDLE_SIZE = 1.8;

interface HandleDef {
  id: HandleId;
  nx: number; // normalized -1..1 in element space
  ny: number;
  cursor: string;
}

const HANDLES: HandleDef[] = [
  { id: 'nw', nx: -1, ny: -1, cursor: 'nw-resize' },
  { id: 'n', nx: 0, ny: -1, cursor: 'n-resize' },
  { id: 'ne', nx: 1, ny: -1, cursor: 'ne-resize' },
  { id: 'e', nx: 1, ny: 0, cursor: 'e-resize' },
  { id: 'se', nx: 1, ny: 1, cursor: 'se-resize' },
  { id: 's', nx: 0, ny: 1, cursor: 's-resize' },
  { id: 'sw', nx: -1, ny: 1, cursor: 'sw-resize' },
  { id: 'w', nx: -1, ny: 0, cursor: 'w-resize' },
];

function getBoundsAndCenter(el: SiteElement): {
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotation: number;
} {
  if (isBox(el)) {
    return { cx: el.x + el.w / 2, cy: el.y + el.h / 2, w: el.w, h: el.h, rotation: el.rotation };
  }
  if (isTree(el)) {
    return {
      cx: el.x,
      cy: el.y,
      w: el.radius * 2,
      h: el.radius * 2,
      rotation: el.rotation,
    };
  }
  if (isText(el)) {
    const approxW = el.text.length * el.fontSize * 0.6;
    const approxH = el.fontSize * 1.2;
    // el.x is the text anchor. Adjust cx so the outline straddles the glyphs.
    let cx: number;
    if (el.align === 'center') cx = el.x;
    else if (el.align === 'right') cx = el.x - approxW / 2;
    else cx = el.x + approxW / 2; // left (default)
    return {
      cx,
      cy: el.y + approxH / 2,
      w: approxW,
      h: approxH,
      rotation: el.rotation,
    };
  }
  if (isPoly(el)) {
    if (el.points.length === 0) return { cx: 0, cy: 0, w: 10, h: 10, rotation: 0 };
    const xs = el.points.map((p) => p.x);
    const ys = el.points.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      w: maxX - minX,
      h: maxY - minY,
      rotation: el.rotation,
    };
  }
  // Dimension elements are handled specially (see early return above)
  return { cx: 0, cy: 0, w: 10, h: 10, rotation: 0 };
}

export const TransformHandles: React.FC<Props> = ({
  el,
  onResizeStart,
  onRotateStart,
}) => {
  // Dimension elements get specialised endpoint handles instead of the standard bounding-box set
  if (isDimension(el)) {
    const hs = HANDLE_SIZE;
    return (
      <g className="editor-only">
        <line
          x1={el.x} y1={el.y} x2={el.x2} y2={el.y2}
          stroke="#0066ff"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
        {/* Endpoint 1 handle (maps to 'nw' in the resize controller) */}
        <rect
          x={el.x - hs / 2} y={el.y - hs / 2}
          width={hs} height={hs}
          fill="white" stroke="#0066ff" strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          onPointerDown={(e) => { e.stopPropagation(); onResizeStart(e, 'nw'); }}
          style={{ cursor: 'move' }}
        />
        {/* Endpoint 2 handle (maps to 'se') */}
        <rect
          x={el.x2 - hs / 2} y={el.y2 - hs / 2}
          width={hs} height={hs}
          fill="white" stroke="#0066ff" strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          onPointerDown={(e) => { e.stopPropagation(); onResizeStart(e, 'se'); }}
          style={{ cursor: 'move' }}
        />
      </g>
    );
  }

  const { cx, cy, w, h, rotation } = getBoundsAndCenter(el);
  const hw = w / 2;
  const hh = h / 2;
  // Handles are small squares; use SVG user-space sizing but rely on vectorEffect for screen-constant display
  const hs = HANDLE_SIZE;
  // Rotation handle: short stem + small circle above the top edge
  const rotHandleOffset = 6;  // world-feet stem length ≈ 26px at default zoom

  return (
    <g
      transform={`translate(${cx},${cy}) rotate(${rotation})`}
      className="editor-only"
    >
      {/* Selection outline */}
      <rect
        x={-hw}
        y={-hh}
        width={w}
        height={h}
        fill="none"
        stroke="#0066ff"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        vectorEffect="non-scaling-stroke"
      />

      {/* Resize handles */}
      {HANDLES.map(({ id, nx, ny, cursor }) => (
        <rect
          key={id}
          x={hw * nx - hs / 2}
          y={hh * ny - hs / 2}
          width={hs}
          height={hs}
          fill="white"
          stroke="#0066ff"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          onPointerDown={(e) => { e.stopPropagation(); onResizeStart(e, id); }}
          style={{ cursor }}
        />
      ))}

      {/* Rotation handle line */}
      <line
        x1={0}
        y1={-hh}
        x2={0}
        y2={-hh - rotHandleOffset}
        stroke="#0066ff"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={0}
        cy={-hh - rotHandleOffset}
        r={1.2}
        fill="white"
        stroke="#0066ff"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        onPointerDown={(e) => { e.stopPropagation(); onRotateStart(e); }}
        style={{ cursor: 'grab' }}
      />
    </g>
  );
};
