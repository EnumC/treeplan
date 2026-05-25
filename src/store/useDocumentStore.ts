import { create } from 'zustand';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import { union as polyUnion } from 'polygon-clipping';
import type {
  SitePlanDocument,
  SiteElement,
  ElementId,
  BoxElement,
  PolyElement,
} from '@/types/document';
import { isBox, isPoly } from '@/types/document';
import { rotatedCorners } from '@/types/geometry';

// Layout convention: y increases downward (SVG coords).
// North = up = small y = backyard.  South = down = large y = street / front yard.
//
// Property: 75 ft wide × 120 ft deep.
// Drawing origin at world (0,0).  All coords in feet.
//
//  y=0  ─── NORTH ─── backyard
//  y=45 ── residence + garage ──
//  y=85 ── driveway + front yard ──
//  y=120 ─ SOUTH ─── street
const DEFAULT_DOCUMENT: SitePlanDocument = {
  schemaVersion: 2,
  id: nanoid(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  title: {
    projectName: 'SITE PLAN',
    addressLine1: '123 OAK STREET',
    addressLine2: 'ANYTOWN, USA',
    date: new Date().toISOString().slice(0, 10),
    drawnBy: 'ERIC',
    scale: '1" = 10\'',
  },
  notes: {
    title: 'NOTES',
    items: [
      'REFER TO LOCAL OR REGIONAL SURVEY STANDARDS.',
      'IT IS THE RESPONSIBILITY OF THE READER TO CONFIRM ALL MEASUREMENTS.',
    ],
  },
  canvas: {
    widthIn: 24,
    heightIn: 18,
    dpiForExport: 300,
    worldUnitsPerInch: 10,
    showGrid: true,
    gridSpacing: 5,
    northAngle: 0,
  },
  elements: [
    // ── Property boundary (dashed outline) — high z so it renders over fills ──
    {
      id: nanoid(),
      type: 'box',
      x: 5, y: 5, w: 75, h: 120,
      rotation: 0, z: 50,
      fill: 'none',
      stroke: '#333',
      strokeWidth: 0.5,
    },

    // ── BACKYARD (top / north) ───────────────────────────────────────────
    {
      id: nanoid(),
      type: 'box',
      x: 5, y: 5, w: 75, h: 40,
      rotation: 0, z: 0,
      fill: 'lawn',
      label: 'BACKYARD',
    },

    // ── PATIO (back-left, attached to rear of house) ─────────────────────
    {
      id: nanoid(),
      type: 'box',
      x: 5, y: 30, w: 28, h: 18,
      rotation: 0, z: 1,
      fill: 'paver',
      label: 'PATIO',
    },

    // ── RESIDENCE ────────────────────────────────────────────────────────
    {
      id: nanoid(),
      type: 'box',
      x: 5, y: 45, w: 55, h: 32,
      rotation: 0, z: 2,
      fill: 'building',
      label: 'RESIDENCE',
    },

    // ── GARAGE (right side of house) ────────────────────────────────────
    {
      id: nanoid(),
      type: 'box',
      x: 60, y: 45, w: 20, h: 26,
      rotation: 0, z: 2,
      fill: 'building',
      label: 'GARAGE',
    },

    // ── DRIVEWAY (from garage down to street) ────────────────────────────
    {
      id: nanoid(),
      type: 'box',
      x: 60, y: 71, w: 20, h: 54,
      rotation: 0, z: 1,
      fill: 'concrete',
      label: 'DRIVEWAY',
    },

    // ── FRONT YARD (between house and street, left of driveway) ──────────
    {
      id: nanoid(),
      type: 'box',
      x: 5, y: 77, w: 55, h: 48,
      rotation: 0, z: 0,
      fill: 'lawn',
      label: 'FRONT YARD',
    },

    // ── SIDEWALK (bottom edge) ───────────────────────────────────────────
    {
      id: nanoid(),
      type: 'box',
      x: 5, y: 120, w: 75, h: 8,
      rotation: 0, z: 1,
      fill: 'concrete',
      label: '',
    },

    // ── STREET LABEL — centered in sidewalk strip ──────────────────────
    {
      id: nanoid(),
      type: 'text',
      x: 42, y: 122,
      text: 'OAK STREET',
      fontSize: 3,
      weight: 'bold',
      align: 'center',
      rotation: 0, z: 20,
    },

    // ── TREES — backyard ─────────────────────────────────────────────────
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'existing-tree',
      x: 14, y: 16, radius: 8,
      rotation: 0, z: 10,
      label: 'OAK (EX)',
    },
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'existing-tree',
      x: 70, y: 18, radius: 7,
      rotation: 0, z: 10,
      label: 'MAPLE (EX)',
    },
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'proposed-tree',
      x: 42, y: 22, radius: 5,
      rotation: 0, z: 10,
      label: 'SERVICEBERRY',
    },
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'ornamental',
      x: 26, y: 38, radius: 4,
      rotation: 0, z: 10,
    },

    // ── TREES — front yard ───────────────────────────────────────────────
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'proposed-tree',
      x: 20, y: 93, radius: 6,
      rotation: 0, z: 10,
      label: 'RED MAPLE',
    },
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'proposed-tree',
      x: 45, y: 98, radius: 6,
      rotation: 0, z: 10,
      label: 'RED MAPLE',
    },

    // ── SHRUBS — along inside of right property edge ──────────────────
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'shrub',
      x: 74, y: 15, radius: 3,
      rotation: 0, z: 10,
    },
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'shrub',
      x: 74, y: 24, radius: 3,
      rotation: 0, z: 10,
    },
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'shrub',
      x: 74, y: 33, radius: 3,
      rotation: 0, z: 10,
    },

    // ── EVERGREEN — left corner ───────────────────────────────────────────
    {
      id: nanoid(),
      type: 'tree',
      subtype: 'evergreen',
      x: 8, y: 90, radius: 5,
      rotation: 0, z: 10,
    },
  ],
  legendOverrides: [],
};

interface TransientPatch {
  id: ElementId;
  patch: Partial<SiteElement>;
}

interface DocumentState {
  document: SitePlanDocument;
  // Transient (outside undo history) patches during drag
  transientPatches: Map<ElementId, Partial<SiteElement>>;
}

interface DocumentActions {
  setDocument: (doc: SitePlanDocument) => void;
  updateElement: (id: ElementId, patch: Partial<SiteElement>) => void;
  addElement: (el: SiteElement) => void;
  removeElements: (ids: ElementId[]) => void;
  duplicateElements: (ids: ElementId[]) => ElementId[];
  updateTitle: (patch: Partial<SitePlanDocument['title']>) => void;
  updateNotes: (patch: Partial<SitePlanDocument['notes']>) => void;
  updateCanvas: (patch: Partial<SitePlanDocument['canvas']>) => void;
  bringForward: (id: ElementId) => void;
  sendBack: (id: ElementId) => void;
  // Merge selected box/poly elements via polygon union.
  // Returns the merged element's id, or undefined if fewer than 2 area elements.
  mergeBoxes: (ids: ElementId[]) => ElementId | undefined;
  // Transient drag (not in undo history)
  updateElementTransient: (id: ElementId, patch: Partial<SiteElement>) => void;
  commitTransform: (patches: TransientPatch[]) => void;
  getElementWithTransient: (id: ElementId) => SiteElement | undefined;
}

type DocumentStore = DocumentState & DocumentActions;

export const useDocumentStore = create<DocumentStore>()(
  temporal(
    (set, get) => ({
      document: DEFAULT_DOCUMENT,
      transientPatches: new Map(),

      setDocument: (doc) => set({ document: doc, transientPatches: new Map() }),

      updateElement: (id, patch) =>
        set((state) => ({
          document: {
            ...state.document,
            updatedAt: new Date().toISOString(),
            elements: state.document.elements.map((el) =>
              el.id === id ? ({ ...el, ...patch } as SiteElement) : el
            ),
          },
        })),

      addElement: (el) =>
        set((state) => ({
          document: {
            ...state.document,
            updatedAt: new Date().toISOString(),
            elements: [...state.document.elements, el],
          },
        })),

      removeElements: (ids) =>
        set((state) => ({
          document: {
            ...state.document,
            updatedAt: new Date().toISOString(),
            elements: state.document.elements.filter(
              (el) => !ids.includes(el.id)
            ),
          },
          transientPatches: new Map(
            [...state.transientPatches.entries()].filter(
              ([id]) => !ids.includes(id)
            )
          ),
        })),

      duplicateElements: (ids) => {
        const state = get();
        const toClone = state.document.elements.filter((el) =>
          ids.includes(el.id)
        );
        const cloned = toClone.map((el) => ({
          ...el,
          id: nanoid(),
          x: el.x + 5,
          y: el.y + 5,
          z: el.z + 1,
        }));
        set((s) => ({
          document: {
            ...s.document,
            updatedAt: new Date().toISOString(),
            elements: [...s.document.elements, ...cloned],
          },
        }));
        return cloned.map((el) => el.id);
      },

      updateTitle: (patch) =>
        set((state) => ({
          document: {
            ...state.document,
            updatedAt: new Date().toISOString(),
            title: { ...state.document.title, ...patch },
          },
        })),

      updateNotes: (patch) =>
        set((state) => ({
          document: {
            ...state.document,
            updatedAt: new Date().toISOString(),
            notes: { ...state.document.notes, ...patch },
          },
        })),

      updateCanvas: (patch) =>
        set((state) => ({
          document: {
            ...state.document,
            updatedAt: new Date().toISOString(),
            canvas: { ...state.document.canvas, ...patch },
          },
        })),

      bringForward: (id) => {
        const state = get();
        const el = state.document.elements.find((e) => e.id === id);
        if (!el) return;
        const maxZ = Math.max(...state.document.elements.map((e) => e.z));
        set((s) => ({
          document: {
            ...s.document,
            elements: s.document.elements.map((e) =>
              e.id === id ? { ...e, z: Math.min(e.z + 1, maxZ + 1) } : e
            ),
          },
        }));
      },

      sendBack: (id) => {
        set((s) => ({
          document: {
            ...s.document,
            elements: s.document.elements.map((e) =>
              e.id === id ? { ...e, z: e.z - 1 } : e
            ),
          },
        }));
      },

      mergeBoxes: (ids) => {
        const state = get();
        const areas = state.document.elements.filter(
          (e): e is BoxElement | PolyElement =>
            ids.includes(e.id) && (isBox(e) || isPoly(e))
        );
        if (areas.length < 2) return undefined;

        const first = areas[0]!;
        const maxZ = Math.max(...areas.map((a) => a.z));

        // Expand each polygon by a tiny epsilon before union so that polygons
        // sharing exactly one edge (adjacent but not overlapping) are treated as
        // overlapping and correctly merged into a single shape by polygon-clipping.
        // The epsilon (0.001 ft ≈ 0.012") rounds away cleanly at 2 d.p.
        const EPS = 0.001;

        function toRing(el: BoxElement | PolyElement): [number, number][] {
          if (isBox(el)) {
            if (el.rotation === 0) {
              // Fast path for axis-aligned boxes: expand in place
              return [
                [el.x - EPS,          el.y - EPS         ],
                [el.x + el.w + EPS,   el.y - EPS         ],
                [el.x + el.w + EPS,   el.y + el.h + EPS  ],
                [el.x - EPS,          el.y + el.h + EPS  ],
                [el.x - EPS,          el.y - EPS         ],
              ];
            }
            // Rotated box: expand in local space before rotating
            const corners = rotatedCorners(
              { x: el.x - EPS, y: el.y - EPS, w: el.w + 2 * EPS, h: el.h + 2 * EPS },
              el.rotation
            );
            const ring: [number, number][] = corners.map((c) => [c.x, c.y] as [number, number]);
            ring.push(ring[0]!);
            return ring;
          } else {
            // PolyElement: expand each point slightly outward from centroid
            const cx = el.points.reduce((s, p) => s + p.x, 0) / el.points.length;
            const cy = el.points.reduce((s, p) => s + p.y, 0) / el.points.length;
            const ring: [number, number][] = el.points.map((p) => {
              const dx = p.x - cx, dy = p.y - cy;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              return [p.x + (dx / len) * EPS, p.y + (dy / len) * EPS] as [number, number];
            });
            ring.push(ring[0]!);
            return ring;
          }
        }

        // Round a coordinate to 2 decimal places so epsilon artifacts disappear
        function r2(v: number) { return Math.round(v * 100) / 100; }

        const multiPolys = areas.map((a) => [[toRing(a)]] as Parameters<typeof polyUnion>[0]);
        const result = polyUnion(multiPolys[0]!, ...multiPolys.slice(1));

        if (!result.length) return undefined;

        let pts: { x: number; y: number }[];

        if (result.length === 1 && result[0]?.[0]) {
          // Single connected polygon — use its outer ring
          pts = result[0][0].slice(0, -1).map(([x, y]) => ({ x: r2(x), y: r2(y) }));
        } else {
          // Polygon-clipping returned multiple disconnected regions even after the
          // epsilon expansion — the selected areas don't touch or overlap at all.
          // Abort rather than creating a bounding box that would cover unrelated elements.
          return undefined;
        }

        // Check if the result is an axis-aligned rectangle (4 unique corners)
        function isAxisAlignedRect(points: { x: number; y: number }[]): boolean {
          if (points.length !== 4) return false;
          const uniqueX = new Set(points.map((p) => Math.round(p.x * 100)));
          const uniqueY = new Set(points.map((p) => Math.round(p.y * 100)));
          return uniqueX.size === 2 && uniqueY.size === 2;
        }

        let merged: SiteElement;
        if (isAxisAlignedRect(pts)) {
          const xs = pts.map((p) => p.x);
          const ys = pts.map((p) => p.y);
          const minX = Math.min(...xs), maxX = Math.max(...xs);
          const minY = Math.min(...ys), maxY = Math.max(...ys);
          const box: BoxElement = {
            id: nanoid(),
            type: 'box',
            x: minX, y: minY,
            w: maxX - minX, h: maxY - minY,
            rotation: 0, z: maxZ,
            fill: (first as BoxElement | PolyElement).fill,
            label: (first as BoxElement | PolyElement).label,
            stroke: (first as BoxElement | PolyElement).stroke,
            strokeWidth: (first as BoxElement | PolyElement).strokeWidth,
          };
          merged = box;
        } else {
          const xs = pts.map((p) => p.x);
          const ys = pts.map((p) => p.y);
          const poly: PolyElement = {
            id: nanoid(),
            type: 'poly',
            x: Math.min(...xs),
            y: Math.min(...ys),
            points: pts,
            rotation: 0, z: maxZ,
            fill: (first as BoxElement | PolyElement).fill,
            label: (first as BoxElement | PolyElement).label,
            stroke: (first as BoxElement | PolyElement).stroke,
            strokeWidth: (first as BoxElement | PolyElement).strokeWidth,
          };
          merged = poly;
        }

        set((s) => ({
          document: {
            ...s.document,
            updatedAt: new Date().toISOString(),
            elements: [
              ...s.document.elements.filter((e) => !ids.includes(e.id)),
              merged,
            ],
          },
        }));
        return merged.id;
      },

      // Transient: writes outside undo history for drag feedback.
      // Calls set() so React re-renders, but only touches transientPatches
      // (not `document`), so zundo's partialize sees no document change and
      // creates no undo entry.
      updateElementTransient: (id, patch) =>
        set((state) => {
          const map = new Map(state.transientPatches);
          map.set(id, { ...(map.get(id) ?? {}), ...patch });
          return { transientPatches: map };
        }),

      // Commits the transient patches into the document (one undo entry)
      commitTransform: (patches) => {
        const tMap = new Map(get().transientPatches);
        set((state) => {
          let elements = state.document.elements;
          for (const { id, patch } of patches) {
            const t = tMap.get(id) ?? {};
            const merged = { ...patch, ...t };
            elements = elements.map((el) =>
              el.id === id ? ({ ...el, ...merged } as SiteElement) : el
            );
          }
          return {
            document: {
              ...state.document,
              updatedAt: new Date().toISOString(),
              elements,
            },
            transientPatches: new Map(),
          };
        });
      },

      getElementWithTransient: (id) => {
        const state = get();
        const el = state.document.elements.find((e) => e.id === id);
        if (!el) return undefined;
        const patch = state.transientPatches.get(id);
        return patch ? ({ ...el, ...patch } as SiteElement) : el;
      },
    }),
    {
      // Only snapshot the document portion (not transient patches or actions)
      partialize: (state) => ({ document: state.document }),
    }
  )
);
