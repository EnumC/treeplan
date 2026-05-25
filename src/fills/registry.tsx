import type React from 'react';
import type { FillType } from '@/types/document';
import { BuildingPattern } from './patterns/BuildingPattern';
import { ConcretePattern } from './patterns/ConcretePattern';
import { PaverPattern } from './patterns/PaverPattern';
import { LawnPattern } from './patterns/LawnPattern';
import { MulchPattern } from './patterns/MulchPattern';
import { WaterPattern } from './patterns/WaterPattern';

export interface FillDef {
  id: FillType;
  displayName: string;
  patternId: string;
  Pattern: React.FC<{ id: string }>;
  // Fill opacity applied to the area rect so trees/details above read clearly.
  // Strokes and labels render at full opacity regardless.
  fillOpacity: number;
}

export const FILL_REGISTRY: Record<FillType, FillDef> = {
  building: {
    id: 'building',
    displayName: 'Structure',
    patternId: 'pat-building',
    Pattern: BuildingPattern,
    fillOpacity: 1,
  },
  concrete: {
    id: 'concrete',
    displayName: 'Concrete',
    patternId: 'pat-concrete',
    Pattern: ConcretePattern,
    fillOpacity: 0.7,
  },
  paver: {
    id: 'paver',
    displayName: 'Pavers',
    patternId: 'pat-paver',
    Pattern: PaverPattern,
    fillOpacity: 0.7,
  },
  lawn: {
    id: 'lawn',
    displayName: 'Lawn',
    patternId: 'pat-lawn',
    Pattern: LawnPattern,
    fillOpacity: 0.65,
  },
  mulch: {
    id: 'mulch',
    displayName: 'Mulch',
    patternId: 'pat-mulch',
    Pattern: MulchPattern,
    fillOpacity: 0.7,
  },
  water: {
    id: 'water',
    displayName: 'Water',
    patternId: 'pat-water',
    Pattern: WaterPattern,
    fillOpacity: 0.75,
  },
  none: {
    id: 'none',
    displayName: '—',
    patternId: '',
    Pattern: () => null,
    fillOpacity: 1,
  },
};
