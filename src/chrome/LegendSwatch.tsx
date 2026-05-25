import type React from 'react';
import type { FillType, TreeSubtype } from '@/types/document';
import type { LegendEntry } from '@/legend/buildLegend';
import { FILL_REGISTRY } from '@/fills/registry';
import { TreeSymbol } from '@/trees/TreeSymbol';

interface Props {
  entry: LegendEntry;
  mode: 'inline' | 'standalone';
}

export const LegendSwatch: React.FC<Props> = ({ entry, mode }) => {
  if (entry.kind === 'fill') {
    const def = FILL_REGISTRY[entry.payload as FillType];
    if (mode === 'inline') {
      return (
        <rect
          width={0.28}
          height={0.18}
          fill={`url(#${def.patternId})`}
          stroke="#333"
          strokeWidth={0.008}
        />
      );
    }
    const localId = `swatch-${def.id}`;
    return (
      <svg width={28} height={18} style={{ display: 'block' }}>
        <defs>
          <def.Pattern id={localId} />
        </defs>
        <rect
          width={28}
          height={18}
          fill={`url(#${localId})`}
          stroke="#333"
          strokeWidth={0.8}
        />
      </svg>
    );
  }

  // Tree
  if (mode === 'inline') {
    return (
      <g transform="translate(0.14, 0.09)">
        <TreeSymbol
          subtype={entry.payload as TreeSubtype}
          radius={0.08}
        />
      </g>
    );
  }
  return (
    <svg
      width={28}
      height={28}
      viewBox="-12 -12 24 24"
      style={{ display: 'block' }}
    >
      <TreeSymbol subtype={entry.payload as TreeSubtype} radius={10} />
    </svg>
  );
};
