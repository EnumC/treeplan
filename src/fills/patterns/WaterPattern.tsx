import type React from 'react';

export const WaterPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} width={16} height={8} patternUnits="userSpaceOnUse">
    <rect width={16} height={8} fill="#a8c8e8" />
    {/* Wavy lines */}
    <path
      d="M0 2 Q4 0 8 2 Q12 4 16 2"
      fill="none"
      stroke="#6898c8"
      strokeWidth={0.7}
    />
    <path
      d="M0 6 Q4 4 8 6 Q12 8 16 6"
      fill="none"
      stroke="#6898c8"
      strokeWidth={0.7}
    />
  </pattern>
);
