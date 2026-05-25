import { useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUIStore, BOX_FILL_MAP, TREE_SUBTYPE_MAP } from '@/store/useUIStore';
import { clientToWorld, marqueeIntersects } from '@/types/geometry';
import type { ElementId, SiteElement, BoxElement, TreeElement, TextElement, DimensionElement } from '@/types/document';
import { isBox, isTree, isText, isPoly, isDimension } from '@/types/document';

export function useToolHandlers(
  svgRef: React.RefObject<SVGSVGElement | null>,
  drawingOriginX: number,
  drawingOriginY: number,
  worldUnitsPerInch: number,
  onElementPointerDown: (e: React.PointerEvent, id: ElementId) => void
) {
  const tool = useUIStore((s) => s.tool);
  const { setTool, setSelection, clearSelection, setMarquee, addToSelection, setEditingText } = useUIStore();
  const { addElement, removeElements, document: doc, updateElementTransient, commitTransform } = useDocumentStore();
  const elements = doc.elements;
  const gridSpacing = doc.canvas.gridSpacing;
  const snapToGrid = useUIStore((s) => s.snapToGrid);

  // Persists across re-renders (addElement triggers one); tracks the in-progress dimension.
  const dimensionIdRef = useRef<string | null>(null);

  function snap(v: number) {
    if (!snapToGrid || gridSpacing <= 0) return v;
    return Math.round(v / gridSpacing) * gridSpacing;
  }

  function getWorldPoint(e: React.PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return clientToWorld(svg, e.clientX, e.clientY, drawingOriginX, drawingOriginY, worldUnitsPerInch);
  }

  function getBoundsForMarquee(el: SiteElement) {
    if (isBox(el)) return { x: el.x, y: el.y, w: el.w, h: el.h };
    if (isTree(el)) return { x: el.x - el.radius, y: el.y - el.radius, w: el.radius * 2, h: el.radius * 2 };
    if (isText(el)) {
      const aw = el.text.length * el.fontSize * 0.6;
      const ah = el.fontSize * 1.2;
      return { x: el.x, y: el.y, w: aw, h: ah };
    }
    if (isPoly(el) && el.points.length > 0) {
      const xs = el.points.map((p) => p.x);
      const ys = el.points.map((p) => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    if (isDimension(el)) {
      const minX = Math.min(el.x, el.x2);
      const minY = Math.min(el.y, el.y2);
      const maxX = Math.max(el.x, el.x2);
      const maxY = Math.max(el.y, el.y2);
      // Add a small buffer so near-horizontal/vertical lines still have selection area
      return { x: minX - 4, y: minY - 4, w: maxX - minX + 8, h: maxY - minY + 8 };
    }
    return { x: 0, y: 0, w: 1, h: 1 };
  }

  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);

  const onCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const pt = getWorldPoint(e);

      if (tool === 'select') {
        // Shift+drag is pan (handled by SVG-level pointer handler); let it bubble.
        if (e.shiftKey) return;
        // Start marquee
        marqueeStartRef.current = { x: pt.x, y: pt.y };
        setMarquee({ x: pt.x, y: pt.y, w: 0, h: 0 });
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        return;
      }

      // Box tools
      if (tool.startsWith('box-')) {
        const fill = BOX_FILL_MAP[tool as keyof typeof BOX_FILL_MAP];
        const newEl: BoxElement = {
          id: nanoid(),
          type: 'box',
          x: snap(pt.x),
          y: snap(pt.y),
          w: 20,
          h: 15,
          fill,
          rotation: 0,
          z: Math.max(0, ...elements.map((e) => e.z)) + 1,
        };
        addElement(newEl);
        setTool('select');
        setSelection([newEl.id]);
        return;
      }

      // Tree tools
      if (tool.startsWith('tree-')) {
        const subtype = TREE_SUBTYPE_MAP[tool as keyof typeof TREE_SUBTYPE_MAP];
        // Shrubs default smaller than full-size trees
        const defaultRadius = subtype === 'shrub' ? 5 : 8;
        const newEl: TreeElement = {
          id: nanoid(),
          type: 'tree',
          x: snap(pt.x),
          y: snap(pt.y),
          radius: defaultRadius,
          subtype,
          rotation: 0,
          z: Math.max(0, ...elements.map((e) => e.z)) + 1,
        };
        addElement(newEl);
        setTool('select');
        setSelection([newEl.id]);
        return;
      }

      // Text tool
      if (tool === 'text') {
        const newEl: TextElement = {
          id: nanoid(),
          type: 'text',
          x: snap(pt.x),
          y: snap(pt.y),
          text: 'Text',
          fontSize: 5,
          weight: 'normal',
          align: 'left',
          rotation: 0,
          z: Math.max(0, ...elements.map((e) => e.z)) + 1,
        };
        addElement(newEl);
        setTool('select');
        setSelection([newEl.id]);
        setEditingText(newEl.id);
        return;
      }

      // Dimension tool: start drag — create zero-length element and stretch to second point
      if (tool === 'dimension') {
        const newEl: DimensionElement = {
          id: nanoid(),
          type: 'dimension',
          x: snap(pt.x),
          y: snap(pt.y),
          x2: snap(pt.x),
          y2: snap(pt.y),
          label: '',
          rotation: 0,
          z: Math.max(0, ...elements.map((e) => e.z)) + 1,
        };
        addElement(newEl);
        dimensionIdRef.current = newEl.id;
        try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* no-op if pointer is not active */ }
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool, elements, snapToGrid, gridSpacing]
  );

  const onCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Live-stretch the second endpoint while drawing a dimension
      if (tool === 'dimension' && dimensionIdRef.current) {
        const pt = getWorldPoint(e);
        updateElementTransient(dimensionIdRef.current, {
          x2: snap(pt.x),
          y2: snap(pt.y),
        } as Partial<SiteElement>);
        return;
      }

      if (tool !== 'select' || !marqueeStartRef.current) return;
      const pt = getWorldPoint(e);
      setMarquee({
        x: marqueeStartRef.current.x,
        y: marqueeStartRef.current.y,
        w: pt.x - marqueeStartRef.current.x,
        h: pt.y - marqueeStartRef.current.y,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool]
  );

  const onCanvasPointerUp = useCallback(
    (e: React.PointerEvent) => {
      // Finish drawing a dimension: commit transient x2/y2, pre-fill distance label, start editing
      if (tool === 'dimension' && dimensionIdRef.current) {
        const id = dimensionIdRef.current;
        dimensionIdRef.current = null;

        // Read the final transient position to compute the distance for the label
        const state = useDocumentStore.getState();
        const transientPatch = state.transientPatches.get(id);
        const base = state.document.elements.find((el) => el.id === id);
        const el = base && isDimension(base) ? { ...base, ...transientPatch } as DimensionElement : null;

        let label = '';
        if (el) {
          const dx = el.x2 - el.x;
          const dy = el.y2 - el.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          label = `${Math.round(dist)}'`;
        }

        commitTransform([{ id, patch: { label } as Partial<SiteElement> }]);
        setTool('select');
        setSelection([id]);
        setEditingText(id);
        return;
      }

      const mq = useUIStore.getState().marquee;
      if (tool === 'select' && mq) {
        const normMq = {
          x: mq.w < 0 ? mq.x + mq.w : mq.x,
          y: mq.h < 0 ? mq.y + mq.h : mq.y,
          w: Math.abs(mq.w),
          h: Math.abs(mq.h),
        };
        if (normMq.w > 1 || normMq.h > 1) {
          // Marquee select
          const selected = elements.filter((el) => {
            const bounds = getBoundsForMarquee(el);
            const rot = isBox(el) ? el.rotation : 0;
            return marqueeIntersects(normMq, bounds, rot);
          });
          setSelection(selected.map((e) => e.id));
        } else {
          // Click on empty = deselect
          if (!e.shiftKey) clearSelection();
        }
      }
      marqueeStartRef.current = null;
      setMarquee(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool, elements]
  );

  return {
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
  };
}
