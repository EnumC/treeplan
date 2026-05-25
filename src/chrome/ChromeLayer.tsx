import type React from 'react';
import type { SitePlanDocument } from '@/types/document';
import { chromeLayout } from './chromeLayout';
import { TitleBlock } from './TitleBlock';
import { Legend } from './Legend';
import { ScaleBar } from './ScaleBar';
import { NorthArrow } from './NorthArrow';
import { NotesBlock } from './NotesBlock';

interface Props {
  doc: SitePlanDocument;
}

export const ChromeLayer: React.FC<Props> = ({ doc }) => {
  const layout = chromeLayout(doc.canvas);

  return (
    <g>
      {/* Outer paper border */}
      <rect
        x={0}
        y={0}
        width={doc.canvas.widthIn}
        height={doc.canvas.heightIn}
        fill="white"
        stroke="#666"
        strokeWidth={0.03}
      />
      {/* Vertical divider between drawing area and chrome */}
      <line
        x1={layout.drawingArea.x + layout.drawingArea.w + 0.15}
        y1={0.15}
        x2={layout.drawingArea.x + layout.drawingArea.w + 0.15}
        y2={doc.canvas.heightIn - 0.15}
        stroke="#666"
        strokeWidth={0.025}
      />
      {/* Drawing area border */}
      <rect
        x={layout.drawingArea.x}
        y={layout.drawingArea.y}
        width={layout.drawingArea.w}
        height={layout.drawingArea.h}
        fill="white"
        stroke="#888"
        strokeWidth={0.015}
      />
      <TitleBlock data={doc.title} rect={layout.titleBlock} />
      <Legend doc={doc} rect={layout.legend} />
      <NotesBlock data={doc.notes} rect={layout.notes} />
      <NorthArrow canvas={doc.canvas} rect={layout.northArrow} />
      <ScaleBar canvas={doc.canvas} rect={layout.scaleBar} />
    </g>
  );
};
