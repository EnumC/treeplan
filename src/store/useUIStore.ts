import { create } from 'zustand';
import type { ElementId, FillType, TreeSubtype } from '@/types/document';

export type SelectTool = 'select';
export type BoxTool =
  | 'box-building'
  | 'box-concrete'
  | 'box-paver'
  | 'box-lawn'
  | 'box-mulch'
  | 'box-water';
export type TreeTool =
  | 'tree-existing'
  | 'tree-proposed'
  | 'tree-evergreen'
  | 'tree-shrub'
  | 'tree-ornamental'
  | 'tree-removing'
  | 'tree-new';
export type TextTool = 'text';
export type DimensionTool = 'dimension';
export type Tool = SelectTool | BoxTool | TreeTool | TextTool | DimensionTool;

export const BOX_FILL_MAP: Record<BoxTool, FillType> = {
  'box-building': 'building',
  'box-concrete': 'concrete',
  'box-paver': 'paver',
  'box-lawn': 'lawn',
  'box-mulch': 'mulch',
  'box-water': 'water',
};

export const TREE_SUBTYPE_MAP: Record<TreeTool, TreeSubtype> = {
  'tree-existing': 'existing-tree',
  'tree-proposed': 'proposed-tree',
  'tree-evergreen': 'evergreen',
  'tree-shrub': 'shrub',
  'tree-ornamental': 'ornamental',
  'tree-removing': 'removing-tree',
  'tree-new': 'new-tree',
};

// ViewBox represents the visible portion of the paper (in paper-inch units).
// Zooming shrinks/grows it; panning shifts its origin.
export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Default: show the entire 24×18 paper
export const DEFAULT_VIEW_BOX: ViewBox = { x: 0, y: 0, w: 24, h: 18 };

interface UIState {
  tool: Tool;
  selection: Set<ElementId>;
  // Camera: viewBox in paper-inch units (replaces zoom/panX/panY)
  viewBox: ViewBox;
  // Hover
  hoveredId: ElementId | null;
  // Text editing
  editingTextId: ElementId | null;
  // Marquee drag
  marquee: { x: number; y: number; w: number; h: number } | null;
  // Snap to grid
  snapToGrid: boolean;
}

interface UIActions {
  setTool: (t: Tool) => void;
  setSelection: (ids: ElementId[]) => void;
  addToSelection: (id: ElementId) => void;
  removeFromSelection: (id: ElementId) => void;
  toggleSelection: (id: ElementId) => void;
  clearSelection: () => void;
  setViewBox: (vb: ViewBox) => void;
  setHovered: (id: ElementId | null) => void;
  setEditingText: (id: ElementId | null) => void;
  setMarquee: (
    m: { x: number; y: number; w: number; h: number } | null
  ) => void;
  toggleSnapToGrid: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()((set) => ({
  tool: 'select',
  selection: new Set(),
  viewBox: DEFAULT_VIEW_BOX,
  hoveredId: null,
  editingTextId: null,
  marquee: null,
  snapToGrid: false,

  setTool: (t) => set({ tool: t }),

  setSelection: (ids) => set({ selection: new Set(ids) }),

  addToSelection: (id) =>
    set((s) => ({ selection: new Set([...s.selection, id]) })),

  removeFromSelection: (id) =>
    set((s) => {
      const next = new Set(s.selection);
      next.delete(id);
      return { selection: next };
    }),

  toggleSelection: (id) =>
    set((s) => {
      const next = new Set(s.selection);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selection: next };
    }),

  clearSelection: () => set({ selection: new Set() }),

  setViewBox: (viewBox) => set({ viewBox }),

  setHovered: (id) => set({ hoveredId: id }),

  setEditingText: (id) => set({ editingTextId: id }),

  setMarquee: (marquee) => set({ marquee }),

  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
}));
