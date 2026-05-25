import type React from 'react';
import type { TextElement } from '@/types/document';

interface Props {
  el: TextElement;
  isSelected?: boolean;
  isHovered?: boolean;
  isEditing?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

const ANCHOR_MAP = {
  left: 'start',
  center: 'middle',
  right: 'end',
} as const;

export const TextView: React.FC<Props> = ({
  el,
  isHovered,
  isEditing,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}) => {
  if (isEditing) return null; // replaced by HTML input overlay

  return (
    <g
      transform={`translate(${el.x},${el.y}) rotate(${el.rotation})`}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ cursor: 'text' }}
    >
      <text
        x={0}
        y={0}
        textAnchor={ANCHOR_MAP[el.align]}
        dominantBaseline="hanging"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={el.fontSize}
        fontWeight={el.weight}
        fill={isHovered ? '#0044cc' : '#222'}
        style={{ userSelect: 'none' }}
      >
        {el.text || (isHovered ? '...' : '')}
      </text>
    </g>
  );
};
