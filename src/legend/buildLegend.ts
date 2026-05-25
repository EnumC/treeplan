import type { SitePlanDocument, FillType, TreeSubtype } from '@/types/document';
import { isBox, isTree } from '@/types/document';
import { FILL_REGISTRY } from '@/fills/registry';
import { TREE_REGISTRY } from '@/trees/registry';

export interface LegendEntry {
  key: string; // "fill:lawn" | "tree:evergreen"
  kind: 'fill' | 'tree';
  payload: FillType | TreeSubtype;
  displayName: string;
}

function applyOverrides(
  entries: LegendEntry[],
  overrides: SitePlanDocument['legendOverrides']
): LegendEntry[] {
  return entries
    .filter((entry) => {
      const ov = overrides.find((o) => o.key === entry.key);
      return !(ov?.hidden);
    })
    .map((entry) => {
      const ov = overrides.find((o) => o.key === entry.key);
      if (ov?.displayName) {
        return { ...entry, displayName: ov.displayName };
      }
      return entry;
    });
}

export function buildLegend(doc: SitePlanDocument): LegendEntry[] {
  const seen = new Map<string, LegendEntry>();

  for (const el of doc.elements) {
    if (isBox(el) && el.fill !== 'none') {
      const key = `fill:${el.fill}`;
      if (!seen.has(key)) {
        seen.set(key, {
          key,
          kind: 'fill',
          payload: el.fill,
          displayName: FILL_REGISTRY[el.fill].displayName,
        });
      }
    } else if (isTree(el)) {
      const key = `tree:${el.subtype}`;
      if (!seen.has(key)) {
        seen.set(key, {
          key,
          kind: 'tree',
          payload: el.subtype,
          displayName: TREE_REGISTRY[el.subtype].displayName,
        });
      }
    }
  }

  return applyOverrides(Array.from(seen.values()), doc.legendOverrides);
}
