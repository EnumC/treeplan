// ---- IDs and discriminators ----

export type ElementId = string; // nanoid()

export type FillType =
  | 'building' // dark gray solid + subtle hatch — RESIDENCE, GARAGE
  | 'concrete' // speckled light gray — DRIVEWAY, SIDEWALK
  | 'paver' // brick grid — PATIO
  | 'lawn' // pale green stipple — BACKYARD, FRONT YARD, side yards
  | 'mulch' // brown dotted — planting beds
  | 'water' // blue wavy lines — pool, pond
  | 'none'; // no fill (just stroke)

export type TreeSubtype =
  | 'existing-tree' // dashed outer ring (denotes pre-existing)
  | 'proposed-tree' // solid outer ring (denotes new planting)
  | 'evergreen' // star-burst / radial spikes
  | 'shrub' // smaller bumpy cloud (hedge unit)
  | 'ornamental' // pink/purple flowering
  | 'removing-tree' // existing tree marked for removal — red X overlay
  | 'new-tree'; // proposed tree with "NEW" badge

// ---- Element variants ----

export interface BaseElement {
  id: ElementId;
  type: 'box' | 'tree' | 'text' | 'poly' | 'dimension';
  x: number; // world units (feet); position is element's local origin
  y: number;
  rotation: number; // degrees, clockwise
  z: number; // stack order; render in ascending order
  locked?: boolean;
}

export interface BoxElement extends BaseElement {
  type: 'box';
  w: number; // world units
  h: number;
  fill: FillType;
  label?: string; // drawn centered, e.g. "RESIDENCE"
  stroke?: string; // default '#222'
  strokeWidth?: number;
}

export interface TreeElement extends BaseElement {
  type: 'tree';
  subtype: TreeSubtype;
  radius: number; // canopy radius in world units (feet)
  label?: string; // e.g. "OAK (EX)" — rendered just below the canopy
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number; // world units (feet); converted to paper inches at render
  weight: 'normal' | 'bold';
  align: 'left' | 'center' | 'right';
}

// Produced by merging two or more BoxElements whose union is non-rectangular.
// Points are in world-feet, absolute (not relative to x/y — x/y track the
// element's bounding-box origin so move/transform math stays consistent).
export interface PolyElement extends BaseElement {
  type: 'poly';
  points: Array<{ x: number; y: number }>; // absolute world-feet coords
  fill: FillType;
  label?: string;
  stroke?: string;
  strokeWidth?: number;
}

// A line between two arbitrary points with a user-editable label.
// Used as a dimension/distance callout on the plan.
export interface DimensionElement extends BaseElement {
  type: 'dimension';
  x2: number; // second endpoint x, world feet (x/y from BaseElement is the first)
  y2: number; // second endpoint y
  label: string; // user-typed text shown below the line, e.g. "24'-6""
}

export type SiteElement = BoxElement | TreeElement | TextElement | PolyElement | DimensionElement;

// ---- Chrome ----

export interface TitleBlock {
  projectName: string; // e.g. "SITE PLAN"
  addressLine1: string; // e.g. "123 OAK STREET"
  addressLine2: string; // e.g. "ANYTOWN, USA"
  date: string; // ISO date; rendered formatted
  drawnBy: string; // e.g. "ERIC"
  scale: string; // display string e.g. "1\" = 10'"
}

export interface NotesBlock {
  title: string; // e.g. "NOTES"
  items: string[]; // rendered as a numbered list
}

export interface CanvasSettings {
  widthIn: number; // paper width in inches (e.g. 24)
  heightIn: number; // paper height in inches (e.g. 18)
  dpiForExport: number; // default 300
  worldUnitsPerInch: number; // print scale. e.g. 10 means 1 paper-inch = 10 ft.
  showGrid: boolean;
  gridSpacing: number; // in world units
  northAngle: number; // degrees from up; 0 = north points up
  // When true, replaces the scale bar with an "ILLUSTRATIVE SCALE" disclaimer.
  // Use for conceptual plans where exact scale doesn't matter.
  illustrativeScale?: boolean;
}

export interface LegendOverride {
  key: string; // "fill:concrete" or "tree:evergreen"
  hidden?: boolean;
  displayName?: string;
}

// ---- Top-level document ----

export interface SitePlanDocument {
  schemaVersion: 1;
  id: string; // nanoid; stable across saves
  createdAt: string; // ISO
  updatedAt: string; // ISO; bumped on every commit
  title: TitleBlock;
  notes: NotesBlock;
  canvas: CanvasSettings;
  elements: SiteElement[];
  legendOverrides: LegendOverride[];
}

// ---- Discriminator helpers ----

export const isBox = (e: SiteElement): e is BoxElement => e.type === 'box';
export const isTree = (e: SiteElement): e is TreeElement => e.type === 'tree';
export const isText = (e: SiteElement): e is TextElement => e.type === 'text';
export const isPoly = (e: SiteElement): e is PolyElement => e.type === 'poly';
export const isDimension = (e: SiteElement): e is DimensionElement => e.type === 'dimension';
