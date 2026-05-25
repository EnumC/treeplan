import type React from 'react';

export const MulchPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} width={10} height={10} patternUnits="userSpaceOnUse">
    <rect width={10} height={10} fill="#b88c5c" />
    {/* Scattered small dots/chunks */}
    <circle cx={2} cy={2} r={0.8} fill="#7a4e2c" />
    <circle cx={5} cy={1} r={0.6} fill="#6a4020" />
    <circle cx={8} cy={3} r={0.9} fill="#7a4e2c" />
    <circle cx={1} cy={6} r={0.7} fill="#6a4020" />
    <circle cx={4} cy={5} r={0.5} fill="#7a4e2c" />
    <circle cx={7} cy={7} r={0.8} fill="#6a4020" />
    <circle cx={3} cy={9} r={0.6} fill="#7a4e2c" />
    <circle cx={9} cy={8} r={0.7} fill="#6a4020" />
    <circle cx={6} cy={4} r={0.4} fill="#7a4e2c" />
    <rect x={1.5} y={7.5} width={2} height={0.6} rx={0.3} fill="#5a3018" transform="rotate(30, 2.5, 7.8)" />
    <rect x={6} y={1.5} width={2} height={0.6} rx={0.3} fill="#5a3018" transform="rotate(-20, 7, 1.8)" />
  </pattern>
);
