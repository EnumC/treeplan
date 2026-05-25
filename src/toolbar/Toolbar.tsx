import React, { useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { downloadProject } from '@/io/saveProject';
import { loadProjectFromFile } from '@/io/loadProject';
import { exportPng } from '@/io/exportPng';
import { exportPdf } from '@/io/exportPdf';
import { FILL_REGISTRY } from '@/fills/registry';
import { TREE_REGISTRY } from '@/trees/registry';
import { TreeSymbol } from '@/trees/TreeSymbol';
import type { Tool, BoxTool, TreeTool } from '@/store/useUIStore';
import { DEFAULT_VIEW_BOX } from '@/store/useUIStore';
import { useStore } from 'zustand';
import type { FillType, TreeSubtype } from '@/types/document';

interface Props {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

const BOX_TOOLS: { tool: BoxTool; fill: FillType }[] = [
  { tool: 'box-building', fill: 'building' },
  { tool: 'box-concrete', fill: 'concrete' },
  { tool: 'box-paver', fill: 'paver' },
  { tool: 'box-lawn', fill: 'lawn' },
  { tool: 'box-mulch', fill: 'mulch' },
  { tool: 'box-water', fill: 'water' },
];

const TREE_TOOLS: { tool: TreeTool; subtype: TreeSubtype }[] = [
  { tool: 'tree-existing', subtype: 'existing-tree' },
  { tool: 'tree-proposed', subtype: 'proposed-tree' },
  { tool: 'tree-evergreen', subtype: 'evergreen' },
  { tool: 'tree-shrub', subtype: 'shrub' },
  { tool: 'tree-ornamental', subtype: 'ornamental' },
  { tool: 'tree-removing', subtype: 'removing-tree' },
  { tool: 'tree-new', subtype: 'new-tree' },
];

export const Toolbar: React.FC<Props> = ({ svgRef }) => {
  const activeTool = useUIStore((s) => s.tool);
  const setTool = useUIStore((s) => s.setTool);
  const snapToGrid = useUIStore((s) => s.snapToGrid);
  const toggleSnapToGrid = useUIStore((s) => s.toggleSnapToGrid);
  const setViewBox = useUIStore((s) => s.setViewBox);
  const doc = useDocumentStore((s) => s.document);
  const setDocument = useDocumentStore((s) => s.setDocument);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { undo, redo } = useStore(useDocumentStore.temporal);

  function handleSave() {
    downloadProject(doc);
  }

  function handleLoad() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loaded = await loadProjectFromFile(file);
      setDocument(loaded);
    } catch (err) {
      alert(`Failed to load file: ${(err as Error).message}`);
    }
    e.target.value = '';
  }

  function handleNew() {
    if (!confirm('Start a new plan? Unsaved changes will be lost.')) return;
    localStorage.removeItem('treeplan:autosave:v1');
    window.location.reload();
  }

  function handleExport() {
    const svg = svgRef.current;
    if (!svg) return;
    const slug =
      doc.title.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
      'site-plan';
    exportPng(svg, {
      dpi: doc.canvas.dpiForExport,
      paperWidthIn: doc.canvas.widthIn,
      paperHeightIn: doc.canvas.heightIn,
      filename: `${slug}.png`,
    }).catch(console.error);
  }

  function handleExportPdf() {
    const svg = svgRef.current;
    if (!svg) return;
    const slug =
      doc.title.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
      'site-plan';
    exportPdf(svg, doc, {
      filename: `${slug}.pdf`,
    }).catch(console.error);
  }

  function btn(t: Tool, label: string, extra?: React.ReactNode) {
    return (
      <button
        key={t}
        onClick={() => setTool(t)}
        title={label}
        style={{
          background: activeTool === t ? '#0066ff' : '#f0f0f0',
          color: activeTool === t ? 'white' : '#333',
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: '4px 8px',
          cursor: 'pointer',
          fontSize: 11,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 52,
        }}
      >
        {extra}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '8px 6px',
        background: '#fafafa',
        borderRight: '1px solid #ddd',
        overflowY: 'auto',
        width: 72,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 10, color: '#888', fontWeight: 'bold', textAlign: 'center' }}>TOOLS</span>

      {btn('select', 'Select')}

      <div style={{ borderTop: '1px solid #eee', margin: '2px 0' }} />
      <span style={{ fontSize: 9, color: '#999', textAlign: 'center' }}>AREAS</span>
      {BOX_TOOLS.map(({ tool, fill }) => {
        const def = FILL_REGISTRY[fill];
        const localId = `tool-${fill}`;
        return (
          <button
            key={tool}
            onClick={() => setTool(tool)}
            title={def.displayName}
            style={{
              background: activeTool === tool ? '#0066ff' : '#f0f0f0',
              color: activeTool === tool ? 'white' : '#333',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              cursor: 'pointer',
              fontSize: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <svg width={28} height={18} style={{ display: 'block', flexShrink: 0 }}>
              <defs>
                <def.Pattern id={localId} />
              </defs>
              <rect width={28} height={18} fill={`url(#${localId})`} stroke="#555" strokeWidth={0.8} />
            </svg>
            <span>{def.displayName}</span>
          </button>
        );
      })}

      <div style={{ borderTop: '1px solid #eee', margin: '2px 0' }} />
      <span style={{ fontSize: 9, color: '#999', textAlign: 'center' }}>TREES</span>
      {TREE_TOOLS.map(({ tool, subtype }) => {
        const def = TREE_REGISTRY[subtype];
        return (
          <button
            key={tool}
            onClick={() => setTool(tool)}
            title={def.displayName}
            style={{
              background: activeTool === tool ? '#0066ff' : '#f0f0f0',
              color: activeTool === tool ? 'white' : '#333',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              cursor: 'pointer',
              fontSize: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <svg width={28} height={28} viewBox="-12 -12 24 24" style={{ display: 'block' }}>
              <TreeSymbol subtype={subtype} radius={10} />
            </svg>
            <span style={{ fontSize: 9, lineHeight: 1.1, textAlign: 'center' }}>{def.displayName}</span>
          </button>
        );
      })}

      {btn('text', 'Text')}
      {btn('dimension', 'Dim',
        <svg width={28} height={18} viewBox="0 0 28 18" style={{ display: 'block' }}>
          <line x1={3} y1={9} x2={25} y2={9} stroke="currentColor" strokeWidth={1.5} />
          <line x1={3} y1={5} x2={3} y2={13} stroke="currentColor" strokeWidth={1.5} />
          <line x1={25} y1={5} x2={25} y2={13} stroke="currentColor" strokeWidth={1.5} />
        </svg>
      )}

      <div style={{ borderTop: '1px solid #eee', margin: '2px 0' }} />
      <span style={{ fontSize: 10, color: '#888', fontWeight: 'bold', textAlign: 'center' }}>FILE</span>

      <button
        onClick={handleNew}
        title="New plan"
        style={{ ...actionBtnStyle, background: '#fff3e0' }}
      >
        New
      </button>
      <button
        onClick={handleSave}
        title="Save project (Cmd+S)"
        style={actionBtnStyle}
      >
        Save
      </button>
      <button
        onClick={handleLoad}
        title="Load project"
        style={actionBtnStyle}
      >
        Load
      </button>
      <button
        onClick={handleExport}
        title="Export PNG (Cmd+E)"
        style={{ ...actionBtnStyle, background: '#e8f4e8' }}
      >
        Export PNG
      </button>
      <button
        onClick={handleExportPdf}
        title="Export PDF — 11×17 Ledger (Cmd+Shift+E)"
        style={{ ...actionBtnStyle, background: '#e0ecf8' }}
      >
        Export PDF
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".siteplan,.json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div style={{ borderTop: '1px solid #eee', margin: '2px 0' }} />
      <button onClick={undo} title="Undo (Cmd+Z)" style={actionBtnStyle}>
        Undo
      </button>
      <button onClick={redo} title="Redo (Cmd+Shift+Z)" style={actionBtnStyle}>
        Redo
      </button>

      <div style={{ borderTop: '1px solid #eee', margin: '2px 0' }} />
      <button
        onClick={toggleSnapToGrid}
        title="Snap to grid"
        style={{ ...actionBtnStyle, background: snapToGrid ? '#ddf' : '#f0f0f0' }}
      >
        {snapToGrid ? 'Snap ON' : 'Snap OFF'}
      </button>
      <button
        onClick={() => setViewBox(DEFAULT_VIEW_BOX)}
        title="Reset zoom and pan to fit full drawing"
        style={actionBtnStyle}
      >
        Reset View
      </button>
    </div>
  );
};

const actionBtnStyle: React.CSSProperties = {
  background: '#f0f0f0',
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: '4px 6px',
  cursor: 'pointer',
  fontSize: 11,
  textAlign: 'center',
};
