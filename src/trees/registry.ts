import type { TreeSubtype } from '@/types/document';

export const TREE_REGISTRY: Record<TreeSubtype, { displayName: string }> = {
  'existing-tree': { displayName: 'Existing tree' },
  'proposed-tree': { displayName: 'Proposed tree' },
  evergreen: { displayName: 'Evergreen' },
  shrub: { displayName: 'Shrub / hedge unit' },
  ornamental: { displayName: 'Ornamental / flowering' },
  'removing-tree': { displayName: 'Remove (existing)' },
  'new-tree': { displayName: 'New tree' },
};
