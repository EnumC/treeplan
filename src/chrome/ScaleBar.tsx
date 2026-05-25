import type React from 'react';
import type { CanvasSettings } from '@/types/document';
import type { Rect } from '@/types/geometry';

interface Props {
  canvas: CanvasSettings;
  rect: Rect;
}

export const ScaleBar: React.FC<Props> = ({ canvas, rect }) => {
  const { x, y, w } = rect;
  const { worldUnitsPerInch } = canvas;

  const cy = y + rect.h / 2;

  // Illustrative mode: replace scale bar with a centered disclaimer
  if (canvas.illustrativeScale) {
    return (
      <g>
        <rect x={x} y={y} width={w} height={rect.h} fill="#f8f6f0" stroke="#444" strokeWidth={0.02} />
        <text
          x={x + w / 2}
          y={cy - 0.06}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Arial', 'Helvetica', sans-serif"
          fontSize={0.11}
          fontWeight="bold"
          fill="#444"
        >
          ILLUSTRATIVE SCALE
        </text>
        <text
          x={x + w / 2}
          y={cy + 0.1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Arial', 'Helvetica', sans-serif"
          fontSize={0.085}
          fontStyle="italic"
          fill="#777"
        >
          Not drawn to scale
        </text>
      </g>
    );
  }

  // Draw a 20-foot scale bar (2 paper inches wide at default scale)
  const scaleW = 20 / worldUnitsPerInch; // paper inches
  const barH = 0.12;
  const tickH = 0.07;
  const barY = y + 0.35;
  const fontSize = 0.13;

  // center the scale bar
  const barX = x + (w - scaleW) / 2;
  const half = scaleW / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={rect.h}
        fill="#f8f6f0"
        stroke="#444"
        strokeWidth={0.02}
      />
      {/* Scale text */}
      <text
        x={x + w / 2}
        y={y + 0.18}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={fontSize}
        fontWeight="bold"
        fill="#222"
      >
        {canvas.worldUnitsPerInch === 10
          ? '0       5      10          20 FT'
          : `SCALE: 1" = ${worldUnitsPerInch}'`}
      </text>
      {/* Bar: alternating filled/empty blocks */}
      <rect x={barX} y={barY} width={half} height={barH} fill="#222" stroke="#222" strokeWidth={0.008} />
      <rect x={barX + half} y={barY} width={half} height={barH} fill="#fff" stroke="#222" strokeWidth={0.008} />
      {/* Tick marks */}
      <line x1={barX} y1={barY - tickH} x2={barX} y2={barY + barH} stroke="#222" strokeWidth={0.01} />
      <line x1={barX + half} y1={barY - tickH} x2={barX + half} y2={barY + barH} stroke="#222" strokeWidth={0.01} />
      <line x1={barX + scaleW} y1={barY - tickH} x2={barX + scaleW} y2={barY + barH} stroke="#222" strokeWidth={0.01} />
      {/* Labels */}
      <text x={barX} y={barY - tickH - 0.02} textAnchor="middle" dominantBaseline="auto" fontFamily="'Arial', 'Helvetica', sans-serif" fontSize={fontSize * 0.85} fill="#333">0</text>
      <text x={barX + half} y={barY - tickH - 0.02} textAnchor="middle" dominantBaseline="auto" fontFamily="'Arial', 'Helvetica', sans-serif" fontSize={fontSize * 0.85} fill="#333">10</text>
      <text x={barX + scaleW} y={barY - tickH - 0.02} textAnchor="middle" dominantBaseline="auto" fontFamily="'Arial', 'Helvetica', sans-serif" fontSize={fontSize * 0.85} fill="#333">20 FT</text>
    </g>
  );
};
