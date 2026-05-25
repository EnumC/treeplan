import type React from 'react';

export const BuildingPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} width={8} height={8} patternUnits="userSpaceOnUse">
    <rect width={8} height={8} fill="#b0acaa" />
    {/* +45° */}
    <line x1={-8} y1={8}  x2={8}  y2={-8} stroke="#969290" strokeWidth={0.22} />
    <line x1={0}  y1={8}  x2={8}  y2={0}  stroke="#969290" strokeWidth={0.22} />
    <line x1={0}  y1={16} x2={16} y2={0}  stroke="#969290" strokeWidth={0.22} />
    {/* −45° */}
    <line x1={0}  y1={0}  x2={8}  y2={8}  stroke="#969290" strokeWidth={0.22} />
    <line x1={-8} y1={0}  x2={8}  y2={16} stroke="#969290" strokeWidth={0.22} />
    <line x1={8}  y1={0}  x2={16} y2={8}  stroke="#969290" strokeWidth={0.22} />
  </pattern>
);
