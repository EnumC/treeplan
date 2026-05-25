import { useCallback, useEffect, useRef } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { clientToWorld } from '@/types/geometry';
import type { ElementId, SiteElement, BoxElement, TreeElement, TextElement, PolyElement, DimensionElement } from '@/types/document';
import { isBox, isTree, isText, isPoly, isDimension } from '@/types/document';

export type HandleId =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'rotate';

interface DragState {
  type: 'move' | 'resize' | 'rotate';
  startWorldX: number;
  startWorldY: number;
  ids: ElementId[];
  initialElements: SiteElement[];
  handle?: HandleId;
}

export function useTransformController(
  svgRef: React.RefObject<SVGSVGElement | null>,
  drawingOriginX: number,
  drawingOriginY: number,
  worldUnitsPerInch: number,
  snapToGrid: boolean,
  gridSpacing: number
) {
  const dragState = useRef<DragState | null>(null);
  const updateElementTransient = useDocumentStore((s) => s.updateElementTransient);
  const commitTransform = useDocumentStore((s) => s.commitTransform);
  const elements = useDocumentStore((s) => s.document.elements);

  function snap(v: number): number {
    if (!snapToGrid || gridSpacing <= 0) return v;
    return Math.round(v / gridSpacing) * gridSpacing;
  }

  function getWorldPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return clientToWorld(svg, clientX, clientY, drawingOriginX, drawingOriginY, worldUnitsPerInch);
  }

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const state = dragState.current;
      if (!state) return;

      const current = getWorldPoint(e.clientX, e.clientY);
      const dx = current.x - state.startWorldX;
      const dy = current.y - state.startWorldY;

      if (state.type === 'move') {
        for (const initEl of state.initialElements) {
          if (isPoly(initEl)) {
            // Poly stores absolute coords in points[], not just x/y
            const points = initEl.points.map((p) => ({
              x: snap(p.x + dx),
              y: snap(p.y + dy),
            }));
            updateElementTransient(initEl.id, {
              x: snap(initEl.x + dx),
              y: snap(initEl.y + dy),
              points,
            } as Partial<SiteElement>);
          } else if (isDimension(initEl)) {
            // Both endpoints must move together
            updateElementTransient(initEl.id, {
              x: snap(initEl.x + dx),
              y: snap(initEl.y + dy),
              x2: snap((initEl as DimensionElement).x2 + dx),
              y2: snap((initEl as DimensionElement).y2 + dy),
            } as Partial<SiteElement>);
          } else {
            const nx = snap(initEl.x + dx);
            const ny = snap(initEl.y + dy);
            updateElementTransient(initEl.id, { x: nx, y: ny });
          }
        }
      } else if (state.type === 'resize' && state.handle) {
        const initEl = state.initialElements[0];
        if (!initEl) return;
        applyResize(initEl, state.handle, dx, dy, current);
      } else if (state.type === 'rotate') {
        const initEl = state.initialElements[0];
        if (!initEl) return;
        applyRotate(initEl, current);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapToGrid, gridSpacing, drawingOriginX, drawingOriginY, worldUnitsPerInch]
  );

  function applyResize(initEl: SiteElement, handle: HandleId, dx: number, dy: number, _current: { x: number; y: number }) {
    if (isBox(initEl)) {
      resizeBox(initEl as BoxElement, handle, dx, dy);
    } else if (isTree(initEl)) {
      resizeTree(initEl as TreeElement, handle, dx, dy);
    } else if (isText(initEl)) {
      resizeText(initEl as TextElement, handle, dx, dy);
    } else if (isPoly(initEl)) {
      resizePoly(initEl as PolyElement, handle, dx, dy);
    } else if (isDimension(initEl)) {
      resizeDimension(initEl as DimensionElement, handle, dx, dy);
    }
  }

  function resizeBox(initEl: BoxElement, handle: HandleId, dx: number, dy: number) {
    // Project world delta into the element's local (rotated) frame.
    const rad = (-initEl.rotation * Math.PI) / 180;
    const lx = Math.cos(rad) * dx - Math.sin(rad) * dy;
    const ly = Math.sin(rad) * dx + Math.cos(rad) * dy;

    // Local-to-world rotation (for moving the origin point).
    const cosR = Math.cos((initEl.rotation * Math.PI) / 180);
    const sinR = Math.sin((initEl.rotation * Math.PI) / 180);

    let w = initEl.w;
    let h = initEl.h;
    // xDelta/yDelta accumulate the world-space shift of the box origin (top-left corner).
    // Both 'w' and 'n' branches may contribute; they must NOT overwrite each other.
    let xDelta = 0;
    let yDelta = 0;

    if (handle.includes('e')) {
      w = Math.max(1, initEl.w + lx);
    }
    if (handle.includes('s')) {
      h = Math.max(1, initEl.h + ly);
    }
    if (handle.includes('w')) {
      // Left edge moves by lx in local x → origin shifts; right edge stays fixed.
      const newW = Math.max(1, initEl.w - lx);
      const actualLx = initEl.w - newW; // clamped local delta
      xDelta += actualLx * cosR;
      yDelta += actualLx * sinR;
      w = newW;
    }
    if (handle.includes('n')) {
      // Top edge moves by ly in local y → origin shifts; bottom edge stays fixed.
      const newH = Math.max(1, initEl.h - ly);
      const actualLy = initEl.h - newH; // clamped local delta
      xDelta += -actualLy * sinR;
      yDelta +=  actualLy * cosR;
      h = newH;
    }

    const x = snap(initEl.x + xDelta);
    const y = snap(initEl.y + yDelta);
    updateElementTransient(initEl.id, { x, y, w: snap(w), h: snap(h) } as Partial<SiteElement>);
  }

  function resizeTree(initEl: TreeElement, _handle: HandleId, dx: number, dy: number) {
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.max(1, initEl.radius + dist * Math.sign(dx + dy));
    updateElementTransient(initEl.id, { radius } as Partial<SiteElement>);
  }

  function resizePoly(initEl: PolyElement, handle: HandleId, dx: number, dy: number) {
    if (initEl.points.length === 0) return;
    const xs = initEl.points.map((p) => p.x);
    const ys = initEl.points.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const bw = maxX - minX, bh = maxY - minY;

    // Anchor: the corner opposite the drag handle
    const anchorX = handle.includes('w') ? maxX : minX;
    const anchorY = handle.includes('n') ? maxY : minY;

    const newW = Math.max(1, handle.includes('e') ? bw + dx : handle.includes('w') ? bw - dx : bw);
    const newH = Math.max(1, handle.includes('s') ? bh + dy : handle.includes('n') ? bh - dy : bh);

    const scaleX = newW / bw;
    const scaleY = newH / bh;

    const points = initEl.points.map((p) => ({
      x: snap(anchorX + (p.x - anchorX) * scaleX),
      y: snap(anchorY + (p.y - anchorY) * scaleY),
    }));
    const newMinX = Math.min(...points.map((p) => p.x));
    const newMinY = Math.min(...points.map((p) => p.y));
    updateElementTransient(initEl.id, {
      x: newMinX,
      y: newMinY,
      points,
    } as Partial<SiteElement>);
  }

  function resizeText(initEl: TextElement, _handle: HandleId, dx: number, dy: number) {
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    const fontSize = Math.max(0.5, initEl.fontSize + delta * 0.5);
    updateElementTransient(initEl.id, { fontSize } as Partial<SiteElement>);
  }

  function resizeDimension(initEl: DimensionElement, handle: HandleId, dx: number, dy: number) {
    if (handle === 'nw') {
      // Drag endpoint 1
      updateElementTransient(initEl.id, {
        x: snap(initEl.x + dx),
        y: snap(initEl.y + dy),
      } as Partial<SiteElement>);
    } else if (handle === 'se') {
      // Drag endpoint 2
      updateElementTransient(initEl.id, {
        x2: snap(initEl.x2 + dx),
        y2: snap(initEl.y2 + dy),
      } as Partial<SiteElement>);
    }
  }

  function applyRotate(initEl: SiteElement, current: { x: number; y: number }) {
    let cx: number, cy: number;
    if (isBox(initEl as SiteElement)) {
      const b = initEl as BoxElement;
      cx = b.x + b.w / 2;
      cy = b.y + b.h / 2;
    } else if (isTree(initEl as SiteElement)) {
      cx = initEl.x;
      cy = initEl.y;
    } else {
      cx = initEl.x;
      cy = initEl.y;
    }
    const angle =
      (Math.atan2(current.x - cx, -(current.y - cy)) * 180) / Math.PI;
    updateElementTransient(initEl.id, { rotation: angle } as Partial<SiteElement>);
  }

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const state = dragState.current;
      if (!state) return;

      // Commit all transient patches accumulated during the drag
      const patches = state.ids.map((id) => ({ id, patch: {} as Partial<SiteElement> }));
      commitTransform(patches);

      dragState.current = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Release pointer capture
      const target = e.currentTarget as Element | null;
      if (target && 'releasePointerCapture' in target) {
        try {
          (target as Element & { releasePointerCapture: (id: number) => void }).releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPointerMove]
  );

  // Remove any window listeners left over if the component unmounts mid-drag
  useEffect(() => {
    return () => {
      if (dragState.current) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        dragState.current = null;
      }
    };
  }, [onPointerMove, onPointerUp]);

  function startMove(e: React.PointerEvent, ids: ElementId[]) {
    e.stopPropagation();
    const world = getWorldPoint(e.clientX, e.clientY);
    const initElements = ids
      .map((id) => elements.find((el) => el.id === id))
      .filter(Boolean) as SiteElement[];

    dragState.current = {
      type: 'move',
      startWorldX: world.x,
      startWorldY: world.y,
      ids,
      initialElements: initElements,
    };

    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function startResize(e: React.PointerEvent, handle: HandleId, id: ElementId) {
    e.stopPropagation();
    const world = getWorldPoint(e.clientX, e.clientY);
    const initEl = elements.find((el) => el.id === id);
    if (!initEl) return;

    dragState.current = {
      type: 'resize',
      startWorldX: world.x,
      startWorldY: world.y,
      ids: [id],
      initialElements: [initEl],
      handle,
    };

    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function startRotate(e: React.PointerEvent, id: ElementId) {
    e.stopPropagation();
    const world = getWorldPoint(e.clientX, e.clientY);
    const initEl = elements.find((el) => el.id === id);
    if (!initEl) return;

    dragState.current = {
      type: 'rotate',
      startWorldX: world.x,
      startWorldY: world.y,
      ids: [id],
      initialElements: [initEl],
    };

    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  return { startMove, startResize, startRotate };
}
