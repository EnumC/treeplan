import type React from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUIStore } from '@/store/useUIStore';
import { ElementView } from './ElementView';
import type { ElementId, SiteElement } from '@/types/document';
import { isTree, isBox, isText } from '@/types/document';
import { clientToWorld } from '@/types/geometry';

interface Props {
  svgRef: React.RefObject<SVGSVGElement | null>;
  drawingOriginX: number;
  drawingOriginY: number;
  onElementPointerDown: (e: React.PointerEvent, id: ElementId) => void;
}

export const ElementsLayer: React.FC<Props> = ({
  onElementPointerDown,
}) => {
  const elements = useDocumentStore((s) => s.document.elements);
  const transientPatches = useDocumentStore((s) => s.transientPatches);
  const selection = useUIStore((s) => s.selection);
  const hoveredId = useUIStore((s) => s.hoveredId);
  const editingTextId = useUIStore((s) => s.editingTextId);
  const setHovered = useUIStore((s) => s.setHovered);

  // Merge transient patches for display
  const displayElements: SiteElement[] = elements.map((el) => {
    const patch = transientPatches.get(el.id);
    return patch ? ({ ...el, ...patch } as SiteElement) : el;
  });

  const sorted = [...displayElements].sort((a, b) => a.z - b.z);

  return (
    <g>
      {sorted.map((el) => {
        const isSelected = selection.has(el.id);
        const isHovered = hoveredId === el.id;
        const isEditing = editingTextId === el.id;

        return (
          <ElementView
            key={el.id}
            el={el}
            isSelected={isSelected}
            isHovered={isHovered}
            isEditing={isEditing}
            onPointerDown={(e) => onElementPointerDown(e, el.id)}
            onPointerEnter={() => setHovered(el.id)}
            onPointerLeave={() => setHovered(null)}
          />
        );
      })}
    </g>
  );
};

