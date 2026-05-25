import type React from 'react';
import type { BoxElement } from '@/types/document';
import { FILL_REGISTRY } from '@/fills/registry';
import { labelFontSize } from '@/types/geometry';

interface Props {
  el: BoxElement;
  isSelected?: boolean;
  isHovered?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

export const BoxView: React.FC<Props> = ({
  el,
  isSelected,
  isHovered,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}) => {
  const fillDef = el.fill !== 'none' ? FILL_REGISTRY[el.fill] : null;
  const fill = fillDef ? `url(#${fillDef.patternId})` : 'none';
  const fillOpacity = fillDef?.fillOpacity ?? 1;

  const strokeColor = el.stroke ?? '#222';
  const strokeWidth = el.strokeWidth ?? 0.5;
  const fontSize = labelFontSize(el.w, el.h);

  return (
    <g
      transform={`translate(${el.x},${el.y}) rotate(${el.rotation}, ${el.w / 2}, ${el.h / 2})`}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ cursor: 'move' }}
    >
      <rect
        x={0}
        y={0}
        width={el.w}
        height={el.h}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={isHovered && !isSelected ? '#0066ff' : strokeColor}
        strokeWidth={isHovered && !isSelected ? strokeWidth * 1.5 : strokeWidth}
        strokeDasharray={el.fill === 'none' ? '2 1.5' : undefined}
      />
      {el.label && (
        <text
          x={el.w / 2}
          y={el.h / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Arial', 'Helvetica', sans-serif"
          fontSize={fontSize}
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
