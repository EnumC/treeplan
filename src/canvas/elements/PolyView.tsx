import type React from 'react';
import type { PolyElement } from '@/types/document';
import { FILL_REGISTRY } from '@/fills/registry';

interface Props {
  el: PolyElement;
  isSelected?: boolean;
  isHovered?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

export const PolyView: React.FC<Props> = ({
  el,
  isSelected,
  isHovered,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}) => {
  if (el.points.length < 3) return null;

  const fillDef = el.fill !== 'none' ? FILL_REGISTRY[el.fill] : null;
  const fill = fillDef ? `url(#${fillDef.patternId})` : 'none';
  const fillOpacity = fillDef?.fillOpacity ?? 1;

  const strokeColor = el.stroke ?? '#222';
  const strokeWidth = el.strokeWidth ?? 0.5;

  const pointsAttr = el.points.map((p) => `${p.x},${p.y}`).join(' ');

  // Compute centroid for label placement
  const cx = el.points.reduce((s, p) => s + p.x, 0) / el.points.length;
  const cy = el.points.reduce((s, p) => s + p.y, 0) / el.points.length;

  // Approximate font size from rough bounding box
  const xs = el.points.map((p) => p.x);
  const ys = el.points.map((p) => p.y);
  const bw = Math.max(...xs) - Math.min(...xs);
  const bh = Math.max(...ys) - Math.min(...ys);
  const labelFontSize = Math.max(1.5, Math.min(bw, bh) * 0.08);

  return (
    <g
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ cursor: 'move' }}
    >
      <polygon
        points={pointsAttr}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={isHovered && !isSelected ? '#0066ff' : strokeColor}
        strokeWidth={isHovered && !isSelected ? strokeWidth * 1.5 : strokeWidth}
      />
      {el.label && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Arial', 'Helvetica', sans-serif"
          fontSize={labelFontSize}
          fontWeight="bold"
          fill="#fff"
          stroke="#333"
          strokeWidth={0.3}
          paintOrder="stroke"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {el.label}
        </text>
      )}
    </g>
  );
};
