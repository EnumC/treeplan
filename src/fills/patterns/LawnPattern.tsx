import type React from 'react';

export const LawnPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} width={8} height={8} patternUnits="userSpaceOnUse">
    <rect width={8} height={8} fill="#c8d885" />
    <circle cx={1.5} cy={2.5} r={0.5} fill="#9ab86a" />
    <circle cx={5} cy={1} r={0.4} fill="#9ab86a" />
    <circle cx={7} cy={3.5} r={0.5} fill="#9ab86a" />
    <circle cx={3} cy={5.5} r={0.4} fill="#9ab86a" />
    <circle cx={6} cy={6.5} r={0.5} fill="#9ab86a" />
    <circle cx={1} cy={7} r={0.4} fill="#9ab86a" />
  </pattern>
);
