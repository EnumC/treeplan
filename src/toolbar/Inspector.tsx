import React from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUIStore } from '@/store/useUIStore';
import { isBox, isTree, isText, isPoly } from '@/types/document';
import type { FillType, TreeSubtype } from '@/types/document';
import { FILL_REGISTRY } from '@/fills/registry';
import { TREE_REGISTRY } from '@/trees/registry';

const FILL_TYPES: FillType[] = ['building', 'concrete', 'paver', 'lawn', 'mulch', 'water', 'none'];
const TREE_SUBTYPES: TreeSubtype[] = [
  'existing-tree',
  'proposed-tree',
  'new-tree',
  'removing-tree',
  'evergreen',
  'shrub',
  'ornamental',
];

export const Inspector: React.FC = () => {
  const selection = useUIStore((s) => s.selection);
  const setSelection = useUIStore((s) => s.setSelection);
  const elements = useDocumentStore((s) => s.document.elements);
  const updateElement = useDocumentStore((s) => s.updateElement);
  const bringForward = useDocumentStore((s) => s.bringForward);
  const sendBack = useDocumentStore((s) => s.sendBack);
  const removeElements = useDocumentStore((s) => s.removeElements);
  const mergeBoxes = useDocumentStore((s) => s.mergeBoxes);
  const clearSelection = useUIStore((s) => s.clearSelection);

  if (selection.size === 0) {
    return (
      <div style={panelStyle}>
        <div style={{ color: '#999', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
          No selection
        </div>
      </div>
    );
  }

  const ids = [...selection];
  const el = elements.find((e) => e.id === ids[0]);
  if (!el) return null;

  function num(
    label: string,
    value: number,
    key: string,
    step = 1
  ) {
    return (
      <div key={key} style={fieldStyle}>
        <label style={labelStyle}>{label}</label>
        <input
          type="number"
          value={Math.round(value * 100) / 100}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) updateElement(el!.id, { [key]: v } as never);
          }}
          style={inputStyle}
        />
      </div>
    );
  }

  function handleDelete() {
    removeElements(ids);
    clearSelection();
  }

  return (
    <div style={panelStyle}>
      <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4 }}>
        {el.type.toUpperCase()} {ids.length > 1 ? `(${ids.length})` : ''}
      </div>

      {num('X (ft)', el.x, 'x')}
      {num('Y (ft)', el.y, 'y')}
      {num('Rotation°', el.rotation, 'rotation')}
      {num('Z-order', el.z, 'z')}

      {isBox(el) && (
        <>
          {num('Width (ft)', el.w, 'w')}
          {num('Height (ft)', el.h, 'h')}
          <div style={fieldStyle}>
            <label style={labelStyle}>Fill</label>
            <select
              value={el.fill}
              onChange={(e) => updateElement(el.id, { fill: e.target.value as FillType })}
              style={inputStyle}
            >
              {FILL_TYPES.map((f) => (
                <option key={f} value={f}>{FILL_REGISTRY[f].displayName}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Label</label>
            <input
              type="text"
              value={el.label ?? ''}
              onChange={(e) => updateElement(el.id, { label: e.target.value })}
              style={inputStyle}
            />
          </div>
        </>
      )}

      {isTree(el) && (
        <>
          {num('Radius (ft)', el.radius, 'radius', 0.5)}
          <div style={fieldStyle}>
            <label style={labelStyle}>Type</label>
            <select
              value={el.subtype}
              onChange={(e) => updateElement(el.id, { subtype: e.target.value as TreeSubtype })}
              style={inputStyle}
            >
              {TREE_SUBTYPES.map((t) => (
                <option key={t} value={t}>{TREE_REGISTRY[t].displayName}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Label</label>
            <input
              type="text"
              value={el.label ?? ''}
              onChange={(e) => updateElement(el.id, { label: e.target.value })}
              style={inputStyle}
            />
          </div>
        </>
      )}

      {isPoly(el) && (
        <>
          <div style={fieldStyle}>
            <label style={labelStyle}>Fill</label>
            <select
              value={el.fill}
              onChange={(e) => updateElement(el.id, { fill: e.target.value as FillType })}
              style={inputStyle}
            >
              {FILL_TYPES.map((f) => (
                <option key={f} value={f}>{FILL_REGISTRY[f].displayName}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Label</label>
            <input
              type="text"
              value={el.label ?? ''}
              onChange={(e) => updateElement(el.id, { label: e.target.value })}
              style={inputStyle}
            />
          </div>
        </>
      )}

      {isText(el) && (
        <>
          <div style={fieldStyle}>
            <label style={labelStyle}>Text</label>
            <input
              type="text"
              value={el.text}
              onChange={(e) => updateElement(el.id, { text: e.target.value })}
              style={inputStyle}
            />
          </div>
          {num('Font size', el.fontSize, 'fontSize', 0.5)}
          <div style={fieldStyle}>
            <label style={labelStyle}>Weight</label>
            <select
              value={el.weight}
              onChange={(e) =>
                updateElement(el.id, { weight: e.target.value as 'normal' | 'bold' })
              }
              style={inputStyle}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Align</label>
            <select
              value={el.align}
              onChange={(e) =>
                updateElement(el.id, { align: e.target.value as 'left' | 'center' | 'right' })
              }
              style={inputStyle}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <button onClick={() => { for (const id of ids) bringForward(id); }} style={smBtnStyle}>↑ Fwd</button>
        <button onClick={() => { for (const id of ids) sendBack(id); }} style={smBtnStyle}>↓ Back</button>
      </div>
      {ids.length >= 2 && ids.every((id) => {
        const e = elements.find((el) => el.id === id);
        return e && (isBox(e) || isPoly(e));
      }) && (
        <button
          onClick={() => {
            const newId = mergeBoxes(ids);
            if (newId) {
              setSelection([newId]);
            } else {
              alert('Areas must overlap or share an edge to be merged.');
            }
          }}
          style={{ ...smBtnStyle, marginTop: 4, width: '100%', background: '#e8f4e8' }}
          title="Merge selected areas (must overlap or share an edge)"
        >
          Merge Areas
        </button>
      )}
      <button
        onClick={handleDelete}
        style={{ ...smBtnStyle, marginTop: 4, background: '#fee', color: '#c00', width: '100%' }}
      >
        Delete
      </button>
    </div>
  );
};

const panelStyle: React.CSSProperties = {
  width: 180,
  flexShrink: 0,
  background: '#fafafa',
  borderLeft: '1px solid #ddd',
  padding: '8px 10px',
  overflowY: 'auto',
  fontSize: 12,
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 6,
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

const smBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '3px 6px',
  border: '1px solid #ddd',
  borderRadius: 3,
  background: '#f0f0f0',
  cursor: 'pointer',
  fontSize: 11,
};
