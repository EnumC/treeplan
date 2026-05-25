import type React from 'react';
import type { TreeElement } from '@/types/document';
import { TreeSymbol } from '@/trees/TreeSymbol';

interface Props {
  el: TreeElement;
  isSelected?: boolean;
  isHovered?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

export const TreeView: React.FC<Props> = ({
  el,
  isHovered,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}) => {
  const labelFontSize = Math.max(el.radius * 0.25, 1.5);

  return (
    <g
      transform={`translate(${el.x},${el.y}) rotate(${el.rotation})`}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ cursor: 'move' }}
    >
      {isHovered && (
        <circle
          r={el.radius * 1.1}
          fill="none"
          stroke="#0066ff"
          strokeWidth={0.4}
          strokeDasharray="2 1"
          className="editor-only"
        />
      )}
      <TreeSymbol subtype={el.subtype} radius={el.radius} seed={el.id} />
      {el.label && (
        <text
          x={0}
          y={el.radius + labelFontSize * 1.2}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontFamily="'Arial', 'Helvetica', sans-serif"
          fontSize={labelFontSize}
          fontWeight="normal"
          fill="#333"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {el.label}
        </text>
      )}
    </g>
  );
};
