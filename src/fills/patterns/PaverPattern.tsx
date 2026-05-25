import type React from 'react';

// Running-bond brick pattern for pavers
export const PaverPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} width={14} height={10} patternUnits="userSpaceOnUse">
    <rect width={14} height={10} fill="#d8cba8" />
    {/* Row 1: two bricks, slightly more square */}
    <rect x={0.5} y={0.5} width={6} height={4} rx={0.2} fill="#e0d4b0" stroke="#b8a888" strokeWidth={0.35} />
    <rect x={7.5} y={0.5} width={6} height={4} rx={0.2} fill="#d8ccaa" stroke="#b8a888" strokeWidth={0.35} />
    {/* Row 2: offset running bond */}
    <rect x={-3} y={5.5} width={6} height={4} rx={0.2} fill="#dcd0b0" stroke="#b8a888" strokeWidth={0.35} />
    <rect x={4} y={5.5} width={6} height={4} rx={0.2} fill="#e0d4b0" stroke="#b8a888" strokeWidth={0.35} />
    <rect x={11} y={5.5} width={6} height={4} rx={0.2} fill="#d8ccaa" stroke="#b8a888" strokeWidth={0.35} />
  </pattern>
);
