import type React from 'react';
import type { NotesBlock as NotesBlockData } from '@/types/document';
import type { Rect } from '@/types/geometry';

interface Props {
  data: NotesBlockData;
  rect: Rect;
}

function wrapLines(text: string, maxLen: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length <= maxLen) { cur = next; }
    else { if (cur) lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines;
}

export const NotesBlock: React.FC<Props> = ({ data, rect }) => {
  const { x, y, w, h } = rect;
  const fontSize = 0.13;
  const lineH = fontSize * 1.55;
  const itemGap = fontSize * 0.9;

  // Build a flat list of positioned text lines with word-wrap
  const entries: Array<{ textY: number; text: string; indent: boolean }> = [];
  let curY = y + 0.38;
  data.items.forEach((item, i) => {
    const lines = wrapLines(`${i + 1}. ${item}`, 48);
    lines.forEach((line, li) => {
      if (curY <= y + h - 0.08) {
        entries.push({ textY: curY, text: line, indent: li > 0 });
        curY += lineH;
      }
    });
    curY += itemGap;
  });

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#f8f6f0" stroke="#444" strokeWidth={0.02} />
      <text
        x={x + w / 2}
        y={y + 0.19}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        fontSize={fontSize * 1.1}
        fontWeight="bold"
        fill="#222"
        letterSpacing="0.01"
      >
        {data.title || 'NOTES'}
      </text>
      <line x1={x + 0.1} y1={y + 0.30} x2={x + w - 0.1} y2={y + 0.30} stroke="#aaa" strokeWidth={0.01} />
      {entries.map((e, i) => (
        <text
          key={i}
          x={x + (e.indent ? 0.24 : 0.12)}
          y={e.textY}
          dominantBaseline="hanging"
          fontFamily="'Arial', 'Helvetica', sans-serif"
          fontSize={fontSize * 0.9}
          fill="#333"
        >
          {e.text}
        </text>
      ))}
    </g>
  );
};
