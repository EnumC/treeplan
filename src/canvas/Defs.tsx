import type React from 'react';
import { FILL_REGISTRY } from '@/fills/registry';

export const Defs: React.FC = () => {
  return (
    <defs>
      {Object.values(FILL_REGISTRY).map(({ id, patternId, Pattern }) =>
        patternId ? <Pattern key={id} id={patternId} /> : null
      )}

      {/* Cast shadow for tree symbols */}
      <filter id="tree-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx={2} dy={3} stdDeviation={2} floodColor="#00000038" />
      </filter>
    </defs>
  );
};
