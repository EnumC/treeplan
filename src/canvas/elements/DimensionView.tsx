import type React from 'react';
import type { DimensionElement } from '@/types/document';
import { useUIStore } from '@/store/useUIStore';

interface Props {
  el: DimensionElement;
  isSelected?: boolean;
  isHovered?: boolean;
  isEditing?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

export const DimensionView: React.FC<Props> = ({
  el,
  isHovered,
  isEditing,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}) => {
  const setEditingText = useUIStore((s) => s.setEditingText);

  if (isEditing) return null; // replaced by TextEditOverlay

  const dx = el.x2 - el.x;
  const dy = el.y2 - el.y;
  const angle = Math.atan2(dy, dx);

  // CCW perpendicular: points "below" for a rightward line (y+ in SVG)
  const perpX = -Math.sin(angle);
  const perpY = Math.cos(angle);

  const tickHalf = 2; // half-length of end ticks, in world feet
  const textOffset = 3.5; // how far below the line to place the label

  const mx = (el.x + el.x2) / 2;
  const my = (el.y + el.y2) / 2;
  const textX = mx + perpX * textOffset;
  const textY = my + perpY * textOffset;

  // Rotate text to be parallel to the line; flip if it would read right-to-left
  let textAngleDeg = (angle * 180) / Math.PI;
  if (Math.cos(angle) < 0) textAngleDeg += 180;

  const lineLen = Math.sqrt(dx * dx + dy * dy);
  const stroke = isHovered ? '#0066ff' : '#444';
  const textFill = isHovered ? '#0066ff' : '#333';

  // Show computed distance if user hasn't typed a label yet
  const displayLabel = el.label || `${Math.round(lineLen)}'`;

  return (
    <g
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onDoubleClick={(e) => { e.stopPropagation(); setEditingText(el.id); }}
      style={{ cursor: 'move' }}
    >
      {/* Wide transparent hit area so thin lines are still easy to click */}
      <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke="transparent" strokeWidth={8} />

      {/* Main dimension line */}
      <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={stroke} strokeWidth={0.5} />

      {/* Perpendicular tick at endpoint 1 */}
      <line
        x1={el.x - perpX * tickHalf} y1={el.y - perpY * tickHalf}
        x2={el.x + perpX * tickHalf} y2={el.y + perpY * tickHalf}
        stroke={stroke} strokeWidth={0.5}
      />

      {/* Perpendicular tick at endpoint 2 */}
      <line
        x1={el.x2 - perpX * tickHalf} y1={el.y2 - perpY * tickHalf}
        x2={el.x2 + perpX * tickHalf} y2={el.y2 + perpY * tickHalf}
        stroke={stroke} strokeWidth={0.5}
      />

      {/* Distance label, rotated along the line and offset to the "below" side */}
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={3.5}
        fill={textFill}
        paintOrder="stroke"
        stroke="white"
        strokeWidth={0.9}
        transform={`rotate(${textAngleDeg}, ${textX}, ${textY})`}
        style={{ userSelect: 'none' }}
      >
        {displayLabel}
      </text>
    </g>
  );
};
