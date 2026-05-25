import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUIStore } from '@/store/useUIStore';
import { isText, isDimension } from '@/types/document';
import type { DimensionElement } from '@/types/document';
import { chromeLayout } from '@/chrome/chromeLayout';

interface Props {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const TextEditOverlay: React.FC<Props> = ({ svgRef }) => {
  const editingTextId = useUIStore((s) => s.editingTextId);
  const setEditingText = useUIStore((s) => s.setEditingText);
  const doc = useDocumentStore((s) => s.document);
  const updateElement = useDocumentStore((s) => s.updateElement);
  const inputRef = useRef<HTMLInputElement>(null);

  const el = editingTextId
    ? doc.elements.find((e) => e.id === editingTextId)
    : null;
  const textEl = el && isText(el) ? el : null;
  const dimEl = el && isDimension(el) ? (el as DimensionElement) : null;
  const editableEl = textEl ?? dimEl;

  useEffect(() => {
    if (editableEl && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editableEl]);

  if (!editableEl || !svgRef.current) return null;

  const svg = svgRef.current;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;

  const canvas = doc.canvas;
  const { drawingArea } = chromeLayout(canvas);
  const drawingOriginX = drawingArea.x;
  const drawingOriginY = drawingArea.y;
  const scaleX = ctm.a / canvas.worldUnitsPerInch;
  const scaleY = ctm.d / canvas.worldUnitsPerInch;

  let screenX: number;
  let screenY: number;
  let fontSize: number;
  let defaultValue: string;
  let fontWeight: string;

  if (textEl) {
    screenX = ctm.e + (drawingOriginX + textEl.x / canvas.worldUnitsPerInch) * ctm.a;
    screenY = ctm.f + (drawingOriginY + textEl.y / canvas.worldUnitsPerInch) * ctm.d;
    fontSize = textEl.fontSize * scaleY;
    defaultValue = textEl.text;
    fontWeight = textEl.weight;
  } else {
    // Dimension: place the input at the label position (midpoint + perpendicular offset)
    const dx = dimEl!.x2 - dimEl!.x;
    const dy = dimEl!.y2 - dimEl!.y;
    const angle = Math.atan2(dy, dx);
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    const mx = (dimEl!.x + dimEl!.x2) / 2 + perpX * 3.5;
    const my = (dimEl!.y + dimEl!.y2) / 2 + perpY * 3.5;
    screenX = ctm.e + (drawingOriginX + mx / canvas.worldUnitsPerInch) * ctm.a;
    screenY = ctm.f + (drawingOriginY + my / canvas.worldUnitsPerInch) * ctm.d;
    fontSize = 3.5 * scaleY;
    defaultValue = dimEl!.label;
    fontWeight = 'normal';
  }

  function commitValue(value: string) {
    if (textEl) {
      updateElement(textEl.id, { text: value });
    } else if (dimEl) {
      updateElement(dimEl.id, { label: value });
    }
    setEditingText(null);
  }

  const overlay = (
    <input
      ref={inputRef}
      defaultValue={defaultValue}
      style={{
        position: 'fixed',
        left: screenX,
        top: screenY,
        fontSize: `${Math.max(fontSize, 10)}px`,
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontWeight,
        border: '1px solid #0066ff',
        outline: 'none',
        background: 'rgba(255,255,255,0.9)',
        padding: '0 2px',
        minWidth: '80px',
        transform: `scaleX(${scaleX / scaleY})`,
        transformOrigin: 'left top',
        zIndex: 1000,
      }}
      onBlur={(e) => commitValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          if (e.key === 'Enter') commitValue(e.currentTarget.value);
          else setEditingText(null);
          e.preventDefault();
        }
        e.stopPropagation();
      }}
    />
  );

  return ReactDOM.createPortal(overlay, document.body);
};
