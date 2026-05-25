import React, { useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';

export const DocumentPanel: React.FC = () => {
  const doc = useDocumentStore((s) => s.document);
  const updateTitle = useDocumentStore((s) => s.updateTitle);
  const updateNotes = useDocumentStore((s) => s.updateNotes);
  const updateCanvas = useDocumentStore((s) => s.updateCanvas);
  const [newNote, setNewNote] = useState('');
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 12,
          right: 200,
          padding: '6px 12px',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12,
          zIndex: 100,
        }}
      >
        Document Settings
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 50,
        right: 200,
        width: 320,
        maxHeight: '70vh',
        overflowY: 'auto',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        padding: 16,
        zIndex: 200,
        fontSize: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong>Document Settings</strong>
        <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
      </div>

      <section>
        <div style={sectionTitle}>Title Block</div>
        {(
          [
            ['Project Name', 'projectName'],
            ['Address Line 1', 'addressLine1'],
            ['Address Line 2', 'addressLine2'],
            ['Date', 'date'],
            ['Drawn By', 'drawnBy'],
            ['Scale', 'scale'],
          ] as [string, keyof typeof doc.title][]
        ).map(([label, key]) => (
          <div key={key} style={fieldStyle}>
            <label style={labelStyle}>{label}</label>
            <input
              type="text"
              value={doc.title[key]}
              onChange={(e) => updateTitle({ [key]: e.target.value })}
              style={inputStyle}
            />
          </div>
        ))}
      </section>

      <section style={{ marginTop: 12 }}>
        <div style={sectionTitle}>Notes</div>
        {doc.notes.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <span style={{ color: '#888', minWidth: 16 }}>{i + 1}.</span>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const items = [...doc.notes.items];
                items[i] = e.target.value;
                updateNotes({ items });
              }}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => {
                const items = doc.notes.items.filter((_, j) => j !== i);
                updateNotes({ items });
              }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c00' }}
            >
              ×
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="text"
            value={newNote}
            placeholder="Add note..."
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newNote.trim()) {
                updateNotes({ items: [...doc.notes.items, newNote.trim()] });
                setNewNote('');
              }
            }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={() => {
              if (newNote.trim()) {
                updateNotes({ items: [...doc.notes.items, newNote.trim()] });
                setNewNote('');
              }
            }}
            style={{ padding: '3px 8px', border: '1px solid #ddd', borderRadius: 3, cursor: 'pointer' }}
          >
            Add
          </button>
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <div style={sectionTitle}>Canvas Settings</div>
        {(
          [
            ['Paper Width (in)', 'widthIn', 1],
            ['Paper Height (in)', 'heightIn', 1],
            ['Export DPI', 'dpiForExport', 50],
            ['Scale (ft per inch)', 'worldUnitsPerInch', 1],
            ['Grid Spacing (ft)', 'gridSpacing', 1],
            ['North Angle (°)', 'northAngle', 5],
          ] as [string, keyof typeof doc.canvas, number][]
        ).map(([label, key, step]) => (
          <div key={key} style={fieldStyle}>
            <label style={labelStyle}>{label}</label>
            <input
              type="number"
              value={doc.canvas[key] as number}
              step={step}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) updateCanvas({ [key]: v });
              }}
              style={inputStyle}
            />
          </div>
        ))}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={doc.canvas.showGrid}
              onChange={(e) => updateCanvas({ showGrid: e.target.checked })}
              style={{ marginRight: 6 }}
            />
            Show Grid
          </label>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={!!doc.canvas.illustrativeScale}
              onChange={(e) => updateCanvas({ illustrativeScale: e.target.checked })}
              style={{ marginRight: 6 }}
            />
            Illustrative scale (replaces scale bar with disclaimer)
          </label>
        </div>
      </section>
    </div>
  );
};

const sectionTitle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: 11,
  color: '#666',
  textTransform: 'uppercase',
  marginBottom: 6,
  borderBottom: '1px solid #eee',
  paddingBottom: 2,
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 5,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#888',
  marginBottom: 2,
};

const inputStyle: React.CSSProperties = {
  padding: '3px 5px',
  border: '1px solid #ddd',
  borderRadius: 3,
  fontSize: 12,
  width: '100%',
  boxSizing: 'border-box',
};
