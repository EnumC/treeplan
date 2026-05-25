import type React from 'react';
import type { TreeSubtype } from '@/types/document';

interface Props {
  subtype: TreeSubtype;
  radius: number; // canopy radius
  seed?: string; // optional id for deterministic eccentricity
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function bumpyCloudPath(r: number, lobes: number): string {
  // Create a bumpy cloud silhouette from arc segments
  let d = '';
  const step = (Math.PI * 2) / lobes;
  for (let i = 0; i < lobes; i++) {
    const angle = i * step - Math.PI / 2;
    const nextAngle = (i + 1) * step - Math.PI / 2;
    const midAngle = angle + step / 2;
    // Control point at slightly larger radius
    const cr = r * 1.15;
    const cx = Math.cos(midAngle) * cr;
    const cy = Math.sin(midAngle) * cr;
    const ex = Math.cos(nextAngle) * r;
    const ey = Math.sin(nextAngle) * r;
    if (i === 0) {
      d += `M${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)} `;
    }
    d += `Q${cx.toFixed(2)},${cy.toFixed(2)} ${ex.toFixed(2)},${ey.toFixed(2)} `;
  }
  return d + 'Z';
}

export const TreeSymbol: React.FC<Props> = ({ subtype, radius: r, seed }) => {
  const ecc = seed ? 0.95 + (hash(seed) % 100) / 1000 : 1;

  switch (subtype) {
    case 'existing-tree':
      return (
        <g filter="url(#tree-shadow)">
          {/* Outer scalloped silhouette — dark ring + dashed stroke */}
          <path
            d={bumpyCloudPath(r, 16)}
            fill="#3e5432"
            stroke="#1a2812"
            strokeWidth={r * 0.1}
            strokeLinejoin="round"
            strokeDasharray={`${r * 0.22} ${r * 0.1}`}
          />
          {/* Main canopy — muted sage green */}
          <path d={bumpyCloudPath(r * 0.88, 14)} fill="#7a9268"/>
          {/* Inner leaf-cluster blobs — slightly lighter, scattered */}
          <g transform={`translate(${-r * 0.12} ${-r * 0.16})`}>
            <path d={bumpyCloudPath(r * 0.44, 9)} fill="#96aa7c"/>
          </g>
          <g transform={`translate(${r * 0.22} ${r * 0.08})`}>
            <path d={bumpyCloudPath(r * 0.38, 8)} fill="#92a678"/>
          </g>
          <g transform={`translate(${-r * 0.2} ${r * 0.22})`}>
            <path d={bumpyCloudPath(r * 0.34, 7)} fill="#96aa7c"/>
          </g>
          <g transform={`translate(${r * 0.08} ${-r * 0.28})`}>
            <path d={bumpyCloudPath(r * 0.30, 7)} fill="#92a678"/>
          </g>
          <circle r={r * 0.07} fill="#4a2e14"/>
        </g>
      );

    case 'proposed-tree':
      return (
        <g filter="url(#tree-shadow)">
          <path
            d={bumpyCloudPath(r, 16)}
            fill="#3e5432"
            stroke="#1a2812"
            strokeWidth={r * 0.1}
            strokeLinejoin="round"
          />
          <path d={bumpyCloudPath(r * 0.88, 14)} fill="#7a9268"/>
          <g transform={`translate(${-r * 0.12} ${-r * 0.16})`}>
            <path d={bumpyCloudPath(r * 0.44, 9)} fill="#96aa7c"/>
          </g>
          <g transform={`translate(${r * 0.22} ${r * 0.08})`}>
            <path d={bumpyCloudPath(r * 0.38, 8)} fill="#92a678"/>
          </g>
          <g transform={`translate(${-r * 0.2} ${r * 0.22})`}>
            <path d={bumpyCloudPath(r * 0.34, 7)} fill="#96aa7c"/>
          </g>
          <g transform={`translate(${r * 0.08} ${-r * 0.28})`}>
            <path d={bumpyCloudPath(r * 0.30, 7)} fill="#92a678"/>
          </g>
          <circle r={r * 0.07} fill="#4a2e14"/>
        </g>
      );

    case 'evergreen':
      return (
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={Math.cos(a) * r}
                y2={Math.sin(a) * r}
                stroke="#2f5a2a"
                strokeWidth={r * 0.08}
                strokeLinecap="round"
              />
            );
          })}
          <circle r={r * 0.55} fill="#3e6b39" />
          <circle r={r * 0.3} fill="#5c8a55" />
        </g>
      );

    case 'shrub':
      return (
        <g filter="url(#tree-shadow)">
          <path
            d={bumpyCloudPath(r, 10)}
            fill="#3e5432"
            stroke="#1a2812"
            strokeWidth={r * 0.1}
            strokeLinejoin="round"
          />
          <path d={bumpyCloudPath(r * 0.82, 9)} fill="#7a9268"/>
          <g transform={`translate(${-r * 0.1} ${-r * 0.1})`}>
            <path d={bumpyCloudPath(r * 0.4, 6)} fill="#96aa7c"/>
          </g>
          <g transform={`translate(${r * 0.15} ${r * 0.1})`}>
            <path d={bumpyCloudPath(r * 0.32, 5)} fill="#92a678"/>
          </g>
        </g>
      );

    case 'ornamental':
      return (
        <g>
          <ellipse
            rx={r}
            ry={r * ecc}
            fill="#d8a8c8"
            stroke="#7a3f6a"
            strokeWidth={r * 0.05}
          />
          <ellipse rx={r * 0.65} ry={r * 0.65 * ecc} fill="#e6c0d8" />
          <ellipse rx={r * 0.35} ry={r * 0.35 * ecc} fill="#f0d5e4" />
          <circle r={r * 0.08} fill="#5b3a1f" />
        </g>
      );

    case 'removing-tree':
      // Existing tree with a bold red X — signals removal on the plan
      return (
        <g filter="url(#tree-shadow)">
          <path
            d={bumpyCloudPath(r, 16)}
            fill="#3e5432"
            stroke="#1a2812"
            strokeWidth={r * 0.1}
            strokeLinejoin="round"
            strokeDasharray={`${r * 0.22} ${r * 0.1}`}
          />
          <path d={bumpyCloudPath(r * 0.88, 14)} fill="#7a9268"/>
          <g transform={`translate(${-r * 0.12} ${-r * 0.16})`}>
            <path d={bumpyCloudPath(r * 0.44, 9)} fill="#96aa7c"/>
          </g>
          <g transform={`translate(${r * 0.22} ${r * 0.08})`}>
            <path d={bumpyCloudPath(r * 0.38, 8)} fill="#92a678"/>
          </g>
          <g transform={`translate(${-r * 0.2} ${r * 0.22})`}>
            <path d={bumpyCloudPath(r * 0.34, 7)} fill="#96aa7c"/>
          </g>
          <g transform={`translate(${r * 0.08} ${-r * 0.28})`}>
            <path d={bumpyCloudPath(r * 0.30, 7)} fill="#92a678"/>
          </g>
          <circle r={r * 0.07} fill="#4a2e14"/>
          <line
            x1={-r * 0.62} y1={-r * 0.62}
            x2={r * 0.62} y2={r * 0.62}
            stroke="#cc0000" strokeWidth={r * 0.14} strokeLinecap="round"
          />
          <line
            x1={r * 0.62} y1={-r * 0.62}
            x2={-r * 0.62} y2={r * 0.62}
            stroke="#cc0000" strokeWidth={r * 0.14} strokeLinecap="round"
          />
        </g>
      );

    case 'new-tree':
      // Bright lime-green canopy with a yellow highlight ring — unmistakably new
      return (
        <g>
          {/* Yellow highlight ring behind canopy */}
          <ellipse
            rx={r * 1.08}
            ry={r * 1.08 * ecc}
            fill="#f5d800"
            stroke="#c8a800"
            strokeWidth={r * 0.03}
          />
          {/* Lime-green canopy — distinct from the darker proposed/existing green */}
          <ellipse
            rx={r}
            ry={r * ecc}
            fill="#b0de40"
            stroke="#6a9010"
            strokeWidth={r * 0.05}
          />
          <ellipse rx={r * 0.78} ry={r * 0.78 * ecc} fill="#c8ec58" />
          <ellipse rx={r * 0.55} ry={r * 0.55 * ecc} fill="#daf070" />
          <ellipse rx={r * 0.3} ry={r * 0.3 * ecc} fill="#eaf880" />
          <circle r={r * 0.08} fill="#5b3a1f" />
          {/* NEW badge */}
          <rect
            x={-r * 0.42} y={-r * 0.22}
            width={r * 0.84} height={r * 0.44}
            rx={r * 0.07}
            fill="#1a6e00"
          />
          <text
            x={0} y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={r * 0.33}
            fontWeight="bold"
            fill="white"
            fontFamily="Arial, Helvetica, sans-serif"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            NEW
          </text>
        </g>
      );
  }
};
