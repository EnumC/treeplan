import React, { useRef, useCallback, useEffect } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUIStore } from '@/store/useUIStore';
import { chromeLayout } from '@/chrome/chromeLayout';
import { ChromeLayer } from '@/chrome/ChromeLayer';
import { Defs } from './Defs';
import { Grid } from './Grid';
import { ElementsLayer } from './ElementsLayer';
import { SelectionLayer } from './selection/SelectionLayer';
import { useTransformController } from './selection/useTransformController';
import { useToolHandlers } from './interactions/useToolHandlers';
import type { ElementId } from '@/types/document';
import { TextEditOverlay } from '@/toolbar/TextEditOverlay';

// Zoom limits in terms of viewBox width (paper inches)
const MIN_VB_WIDTH = 2;   // ~10× zoom
const MAX_VB_WIDTH = 96;  // ~0.25× zoom

interface Props {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const SvgStage: React.FC<Props> = ({ svgRef }) => {
  const doc = useDocumentStore((s) => s.document);
  const { canvas } = doc;
  const selection = useUIStore((s) => s.selection);
  const tool = useUIStore((s) => s.tool);
  const viewBox = useUIStore((s) => s.viewBox);
  const setViewBox = useUIStore((s) => s.setViewBox);
  const snapToGrid = useUIStore((s) => s.snapToGrid);
  const setSelection = useUIStore((s) => s.setSelection);
  const toggleSelection = useUIStore((s) => s.toggleSelection);

  const layout = chromeLayout(canvas);
  const drawingOriginX = layout.drawingArea.x;
  const drawingOriginY = layout.drawingArea.y;

  const { startMove, startResize, startRotate } = useTransformController(
    svgRef,
    drawingOriginX,
    drawingOriginY,
    canvas.worldUnitsPerInch,
    snapToGrid,
    canvas.gridSpacing
  );

  const handleElementPointerDown = useCallback(
    (e: React.PointerEvent, id: ElementId) => {
      e.stopPropagation();
      if (tool !== 'select') return;

      if (e.shiftKey) {
        toggleSelection(id);
      } else {
        if (!selection.has(id)) {
          setSelection([id]);
        }
        const ids = selection.has(id) ? [...selection] : [id];
        startMove(e, ids);
      }
    },
    [tool, selection, setSelection, toggleSelection, startMove]
  );

  const { onCanvasPointerDown, onCanvasPointerMove, onCanvasPointerUp } =
    useToolHandlers(
      svgRef,
      drawingOriginX,
      drawingOriginY,
      canvas.worldUnitsPerInch,
      handleElementPointerDown
    );

  // ── Zoom via scroll wheel ────────────────────────────────────────────────
  // Zoom by adjusting the viewBox around the cursor position (in paper-inch
  // space). Since we use viewBox (not CSS transform), getScreenCTM() always
  // gives the correct paper-inch ↔ screen mapping.
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      // Cursor in paper-inch SVG space
      const pt = new DOMPoint(e.clientX, e.clientY);
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const cursor = pt.matrixTransform(ctm.inverse());

      const { viewBox: vb, setViewBox: svb } = useUIStore.getState();

      // Pinch-to-zoom on trackpads sends ctrlKey + deltaY; plain scroll moves Y.
      // Use multiplicative step so zooming feels consistent at any zoom level.
      const zoomIn = e.deltaY < 0;
      const factor = zoomIn ? 1 / 1.12 : 1.12;

      const nw = Math.min(MAX_VB_WIDTH, Math.max(MIN_VB_WIDTH, vb.w * factor));
      const nh = nw * (vb.h / vb.w); // preserve aspect ratio
      const actualFactor = nw / vb.w;

      // Keep cursor point fixed: newVB.x = cursor.x - (cursor.x - vb.x) * actualFactor
      const nx = cursor.x - (cursor.x - vb.x) * actualFactor;
      const ny = cursor.y - (cursor.y - vb.y) * actualFactor;

      svb({ x: nx, y: ny, w: nw, h: nh });
    },
    []
  );

  // ── Pan via space+drag or middle-button drag ─────────────────────────────
  const spaceDown = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOriginVB = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.code === 'Space' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        spaceDown.current = true;
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        spaceDown.current = false;
        isPanning.current = false;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleSvgPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const startsPan = e.button === 1 || (e.button === 0 && (spaceDown.current || e.shiftKey));
      if (!startsPan) return;

      e.preventDefault();
      e.stopPropagation();
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      const { viewBox: vb } = useUIStore.getState();
      panOriginVB.current = { x: vb.x, y: vb.y };
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    },
    []
  );

  const handleSvgPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isPanning.current) return;
      const svg = svgRef.current;
      if (!svg) return;

      // Convert screen-pixel delta to viewBox-unit delta using current CTM scale
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const dx = -(e.clientX - panStart.current.x) / ctm.a;
      const dy = -(e.clientY - panStart.current.y) / ctm.d;

      const { viewBox: vb, setViewBox: svb } = useUIStore.getState();
      svb({
        x: panOriginVB.current.x + dx,
        y: panOriginVB.current.y + dy,
        w: vb.w,
        h: vb.h,
      });
    },
    []
  );

  const handleSvgPointerUp = useCallback(
    (_e: React.PointerEvent<SVGSVGElement>) => {
      if (isPanning.current && !spaceDown.current) {
        isPanning.current = false;
      }
    },
    []
  );

  const cursor = isPanning.current
    ? 'grabbing'
    : spaceDown.current
      ? 'grab'
      : tool === 'select'
        ? 'default'
        : tool === 'text'
          ? 'text'
          : 'crosshair'; // dimension, box, tree tools all get crosshair

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#e8e8e8',
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          cursor,
        }}
        onWheel={handleWheel}
        onPointerDown={handleSvgPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
      >
        <Defs />
        <ChromeLayer doc={doc} />

        {/* Drawing area group: world-feet coordinates */}
        <g
          transform={`translate(${drawingOriginX}, ${drawingOriginY}) scale(${1 / canvas.worldUnitsPerInch})`}
        >
          <Grid
            canvas={canvas}
            drawingW={layout.drawingArea.w}
            drawingH={layout.drawingArea.h}
          />

          {/* Transparent hit area for canvas interactions */}
          <rect
            x={0}
            y={0}
            width={layout.drawingArea.w * canvas.worldUnitsPerInch}
            height={layout.drawingArea.h * canvas.worldUnitsPerInch}
            fill="transparent"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
          />

          <ElementsLayer
            svgRef={svgRef}
            drawingOriginX={drawingOriginX}
            drawingOriginY={drawingOriginY}
            onElementPointerDown={handleElementPointerDown}
          />

          <SelectionLayer
            onResizeStart={(e, handle, id) => startResize(e, handle, id)}
            onRotateStart={(e, id) => startRotate(e, id)}
          />
        </g>
      </svg>

      <TextEditOverlay svgRef={svgRef} />
    </div>
  );
};
