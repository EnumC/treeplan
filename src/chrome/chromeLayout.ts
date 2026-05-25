import type { CanvasSettings } from '@/types/document';
import type { Rect } from '@/types/geometry';

export interface ChromeLayout {
  drawingArea: Rect;
  titleBlock: Rect;
  legend: Rect;
  notes: Rect;
  scaleBar: Rect;
  northArrow: Rect;
}

export function chromeLayout(canvas: CanvasSettings): ChromeLayout {
  const { widthIn, heightIn } = canvas;
  const chromeW = 5; // right-hand panel width
  const margin = 0.25;
  const drawingW = widthIn - chromeW - margin;

  const titleH = 1.5;
  const northH = 1.2;
  const scaleH = 0.8;
  const notesH = 3.0;
  const legendY = margin + titleH + margin;
  const legendH =
    heightIn - margin - titleH - margin - northH - margin - scaleH - margin - notesH - margin;

  return {
    drawingArea: {
      x: margin,
      y: margin,
      w: drawingW,
      h: heightIn - margin * 2,
    },
    titleBlock: {
      x: drawingW + margin * 2,
      y: margin,
      w: chromeW - margin * 2,
      h: titleH,
    },
    legend: {
      x: drawingW + margin * 2,
      y: legendY,
      w: chromeW - margin * 2,
      h: Math.max(legendH, 2),
    },
    notes: {
      x: drawingW + margin * 2,
      y: legendY + Math.max(legendH, 2) + margin,
      w: chromeW - margin * 2,
      h: notesH,
    },
    northArrow: {
      x: drawingW + margin * 2,
      y: heightIn - margin - scaleH - margin - northH,
      w: chromeW - margin * 2,
      h: northH,
    },
    scaleBar: {
      x: drawingW + margin * 2,
      y: heightIn - margin - scaleH,
      w: chromeW - margin * 2,
      h: scaleH,
    },
  };
}
