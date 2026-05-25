import type React from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUIStore } from '@/store/useUIStore';
import { TransformHandles } from './TransformHandles';
import type { HandleId } from './useTransformController';
import type { ElementId } from '@/types/document';

interface Props {
  onResizeStart: (e: React.PointerEvent, handle: HandleId, id: ElementId) => void;
  onRotateStart: (e: React.PointerEvent, id: ElementId) => void;
}

export const SelectionLayer: React.FC<Props> = ({
  onResizeStart,
  onRotateStart,
}) => {
  const selection = useUIStore((s) => s.selection);
  const elements = useDocumentStore((s) => s.document.elements);
  const transientPatches = useDocumentStore((s) => s.transientPatches);
  const marquee = useUIStore((s) => s.marquee);

  return (
    <g className="editor-only">
      {[...selection].map((id) => {
        const base = elements.find((e) => e.id === id);
        if (!base) return null;
        const patch = transientPatches.get(id);
        const el = patch ? ({ ...base, ...patch } as typeof base) : base;

        return (
          <TransformHandles
            key={id}
            el={el}
            onResizeStart={(e, handle) => onResizeStart(e, handle, id)}
            onRotateStart={(e) => onRotateStart(e, id)}
          />
        );
      })}

      {/* Marquee drag rectangle */}
      {marquee && (
        <rect
          x={marquee.x < 0 ? marquee.x + marquee.w : marquee.x}
          y={marquee.y < 0 ? marquee.y + marquee.h : marquee.y}
          width={Math.abs(marquee.w)}
          height={Math.abs(marquee.h)}
          fill="rgba(0, 102, 255, 0.08)"
          stroke="#0066ff"
          strokeWidth={0.5}
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </g>
  );
};
