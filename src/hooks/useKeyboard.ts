import { useEffect } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUIStore } from '@/store/useUIStore';
import { downloadProject } from '@/io/saveProject';
import { exportPng } from '@/io/exportPng';
import { exportPdf } from '@/io/exportPdf';
import { useStore } from 'zustand';

export function useKeyboard(svgRef: React.RefObject<SVGSVGElement | null>) {
  const { undo, redo } = useStore(useDocumentStore.temporal);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't fire when focused in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const meta = e.metaKey || e.ctrlKey;

      // Tool shortcuts
      if (!meta && e.key === 'v') useUIStore.getState().setTool('select');
      if (!meta && e.key === 'r') useUIStore.getState().setTool('box-building');
      if (!meta && e.key === 't') useUIStore.getState().setTool('tree-existing');
      if (!meta && e.key === 'x') useUIStore.getState().setTool('text');

      // Esc
      if (e.key === 'Escape') {
        useUIStore.getState().clearSelection();
        useUIStore.getState().setTool('select');
        useUIStore.getState().setEditingText(null);
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sel = [...useUIStore.getState().selection];
        if (sel.length > 0) {
          useDocumentStore.getState().removeElements(sel);
          useUIStore.getState().clearSelection();
        }
      }

      // Undo/redo
      if (meta && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (meta && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        redo();
      }

      // Save
      if (meta && e.key === 's') {
        e.preventDefault();
        const doc = useDocumentStore.getState().document;
        downloadProject(doc);
      }

      // Export PNG
      if (meta && !e.shiftKey && e.key === 'e') {
        e.preventDefault();
        const doc = useDocumentStore.getState().document;
        const svg = svgRef.current;
        if (svg) {
          const slug = doc.title.projectName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') || 'site-plan';
          exportPng(svg, {
            dpi: doc.canvas.dpiForExport,
            paperWidthIn: doc.canvas.widthIn,
            paperHeightIn: doc.canvas.heightIn,
            filename: `${slug}.png`,
          }).catch(console.error);
        }
      }

      // Export PDF (11×17 Ledger)
      if (meta && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        const doc = useDocumentStore.getState().document;
        const svg = svgRef.current;
        if (svg) {
          const slug = doc.title.projectName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') || 'site-plan';
          exportPdf(svg, doc, {
            filename: `${slug}.pdf`,
          }).catch(console.error);
        }
      }

      // Duplicate
      if (meta && e.key === 'd') {
        e.preventDefault();
        const sel = [...useUIStore.getState().selection];
        if (sel.length > 0) {
          const store = useDocumentStore.getState();
          const newIds = store.duplicateElements(sel) as unknown as string[];
          if (Array.isArray(newIds)) {
            useUIStore.getState().setSelection(newIds);
          }
        }
      }

      // Arrow nudge
      const nudge = e.shiftKey ? 10 : 1;
      let dx = 0,
        dy = 0;
      if (e.key === 'ArrowLeft') dx = -nudge;
      if (e.key === 'ArrowRight') dx = nudge;
      if (e.key === 'ArrowUp') dy = -nudge;
      if (e.key === 'ArrowDown') dy = nudge;
      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        const sel = [...useUIStore.getState().selection];
        const store = useDocumentStore.getState();
        for (const id of sel) {
          const el = store.document.elements.find((e) => e.id === id);
          if (el) {
            store.updateElement(id, { x: el.x + dx, y: el.y + dy });
          }
        }
      }

      // Z-order
      if (e.key === ']') {
        const sel = [...useUIStore.getState().selection];
        for (const id of sel) useDocumentStore.getState().bringForward(id);
      }
      if (e.key === '[') {
        const sel = [...useUIStore.getState().selection];
        for (const id of sel) useDocumentStore.getState().sendBack(id);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo, svgRef]);
}
