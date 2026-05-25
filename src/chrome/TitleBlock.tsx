import type React from 'react';
import type { TitleBlock as TitleBlockData } from '@/types/document';
import type { Rect } from '@/types/geometry';

interface Props {
  data: TitleBlockData;
  rect: Rect;
}

export const TitleBlock: React.FC<Props> = ({ data, rect }) => {
  const { x, y, w, h } = rect;
  const cx = x + w / 2;
  const fontSize = 0.18;

  const dateStr = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="#f8f6f0"
        stroke="#444"
        strokeWidth={0.025}
      />
      {/* Thick top rule */}
      <line
        x1={x}
        y1={y + h * 0.45}
        x2={x + w}
        y2={y + h * 0.45}
        stroke="#444"
        strokeWidth={0.02}
      />
      {/* Project name */}
      <text
        x={cx}
        y={y + h * 0.22}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={fontSize * 1.4}
        fontWeight="bold"
        fill="#222"
        letterSpacing="0.02"
      >
        {data.projectName || 'SITE PLAN'}
      </text>
      {/* Address line 1 */}
      <text
        x={cx}
        y={y + h * 0.6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={fontSize}
        fill="#333"
      >
        {data.addressLine1}
      </text>
      {/* Address line 2 */}
      <text
        x={cx}
        y={y + h * 0.74}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={fontSize}
        fill="#333"
      >
        {data.addressLine2}
      </text>
      {/* Date / drawn by */}
      <text
        x={x + w * 0.05}
        y={y + h * 0.9}
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={fontSize * 0.78}
        fill="#555"
      >
        {dateStr}
      </text>
      {data.drawnBy && (
        <text
          x={x + w * 0.7}
          y={y + h * 0.9}
          dominantBaseline="middle"
          fontFamily="'Arial', 'Helvetica', sans-serif"
          fontSize={fontSize * 0.78}
          fill="#555"
        >
          BY: {data.drawnBy}
        </text>
      )}
    </g>
  );
};
