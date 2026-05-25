import type React from 'react';

export const ConcretePattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} width={12} height={12} patternUnits="userSpaceOnUse">
    <rect width={12} height={12} fill="#e8e4dc" />
    {/* Sparse stipple dots */}
    <circle cx={2} cy={3} r={0.4} fill="#c8c4bc" />
    <circle cx={7} cy={1.5} r={0.3} fill="#b8b4ac" />
    <circle cx={10} cy={5} r={0.4} fill="#c8c4bc" />
    <circle cx={4} cy={8} r={0.3} fill="#b8b4ac" />
    <circle cx={9} cy={10} r={0.4} fill="#c8c4bc" />
    <circle cx={1} cy={10} r={0.3} fill="#b8b4ac" />
    <circle cx={5.5} cy={5.5} r={0.2} fill="#c8c4bc" />
    <circle cx={11} cy={8} r={0.3} fill="#b8b4ac" />
  </pattern>
);
