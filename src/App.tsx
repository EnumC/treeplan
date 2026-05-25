import { useEffect, useRef } from 'react';
import { SvgStage } from './canvas/SvgStage';
import { Toolbar } from './toolbar/Toolbar';
import { Inspector } from './toolbar/Inspector';
import { DocumentPanel } from './toolbar/DocumentPanel';
import { initPersistence } from './store/persistence';
import { useKeyboard } from './hooks/useKeyboard';

let persistenceInitialized = false;

function App() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!persistenceInitialized) {
      persistenceInitialized = true;
      initPersistence();
    }
  }, []);

  useKeyboard(svgRef);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily: "'Arial', 'Helvetica', sans-serif",
      }}
    >
      <Toolbar svgRef={svgRef} />
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <SvgStage svgRef={svgRef} />
      </div>
      <Inspector />
      <DocumentPanel />
    </div>
  );
}

export default App;
