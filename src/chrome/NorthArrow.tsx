import type React from 'react';
import type { CanvasSettings } from '@/types/document';
import type { Rect } from '@/types/geometry';

interface Props {
  canvas: CanvasSettings;
  rect: Rect;
}

export const NorthArrow: React.FC<Props> = ({ canvas, rect }) => {
  const { x, y, w, h } = rect;

  // Arrow symbol proportions chosen so total height == total width (square icon).
  // Height = (0.75 + 0.25 + 0.5) * r = 1.5r  |  Width = 2 * 0.75 * r = 1.5r
  const size = Math.min(w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = size * 0.45;

  const angle = canvas.northAngle;
  const rad = (angle * Math.PI) / 180;

  const tipX = cx + Math.sin(rad) * r * -0.75;
  const tipY = cy - Math.cos(rad) * r * 0.75;
  const baseX = cx - Math.sin(rad) * r * 0.5;
  const baseY = cy + Math.cos(rad) * r * 0.5;
  const leftX = cx - Math.cos(rad) * r * 0.75;
  const leftY = cy - Math.sin(rad) * r * 0.75;
  const rightX = cx + Math.cos(rad) * r * 0.75;
  const rightY = cy + Math.sin(rad) * r * 0.75;

  const fontSize = size * 0.18;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="#f8f6f0"
        stroke="#444"
        strokeWidth={0.02}
      />
      {/* Filled half (dark) */}
      <path
        d={`M${tipX},${tipY} L${leftX},${leftY} L${baseX},${baseY} Z`}
        fill="#222"
      />
      {/* Unfilled half */}
      <path
        d={`M${tipX},${tipY} L${rightX},${rightY} L${baseX},${baseY} Z`}
        fill="#fff"
        stroke="#222"
        strokeWidth={0.015}
      />
      {/* N label */}
      <text
        x={tipX + Math.sin(rad) * r * -0.25}
        y={tipY - Math.cos(rad) * r * 0.25}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={fontSize}
        fontWeight="bold"
        fill="#222"
      >
        N
      </text>
    </g>
  );
};
