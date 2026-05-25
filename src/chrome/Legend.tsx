import { useMemo } from 'react';
import type React from 'react';
import type { SitePlanDocument } from '@/types/document';
import type { Rect } from '@/types/geometry';
import { buildLegend } from '@/legend/buildLegend';
import { LegendSwatch } from './LegendSwatch';

interface Props {
  doc: SitePlanDocument;
  rect: Rect;
}

export const Legend: React.FC<Props> = ({ doc, rect }) => {
  const entries = useMemo(() => buildLegend(doc), [doc.elements, doc.legendOverrides]);
  const { x, y, w, h } = rect;
  const fontSize = 0.155;
  const rowH = 0.33;
  const swatchW = 0.32;
  const swatchH = 0.20;

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
      {/* Title */}
      <text
        x={x + w / 2}
        y={y + 0.18}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={fontSize * 1.1}
        fontWeight="bold"
        fill="#222"
        letterSpacing="0.01"
      >
        LEGEND
      </text>
      <line
        x1={x + 0.1}
        y1={y + 0.3}
        x2={x + w - 0.1}
        y2={y + 0.3}
        stroke="#aaa"
        strokeWidth={0.01}
      />

      {entries.map((entry, i) => {
        const ry = y + 0.38 + i * rowH;
        if (ry + rowH > y + h - 0.1) return null; // overflow guard
        return (
          <g key={entry.key}>
            {/* Swatch */}
            <g transform={`translate(${x + 0.1}, ${ry})`}>
              <LegendSwatch entry={entry} mode="inline" />
            </g>
            {/* Label */}
            <text
              x={x + 0.1 + swatchW + 0.08}
              y={ry + swatchH / 2}
              dominantBaseline="middle"
              fontFamily="'Arial', 'Helvetica', sans-serif"
              fontSize={fontSize}
              fill="#333"
            >
              {entry.displayName}
            </text>
          </g>
        );
      })}
    </g>
  );
};
