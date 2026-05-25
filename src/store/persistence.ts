import { useDocumentStore } from './useDocumentStore';
import { migrate } from '@/io/migrations';

const AUTOSAVE_KEY = 'treeplan:autosave:v1';
const AUTOSAVE_META_KEY = 'treeplan:autosave:meta:v1';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function hydrateFromRaw(raw: string) {
  const parsed: unknown = JSON.parse(raw);
  const doc = migrate(parsed);
  useDocumentStore.getState().setDocument(doc);
}

function subscribeForAutosave() {
  useDocumentStore.subscribe((state) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        localStorage.setItem(
          AUTOSAVE_KEY,
          JSON.stringify(state.document)
        );
        localStorage.setItem(
          AUTOSAVE_META_KEY,
          JSON.stringify({ savedAt: new Date().toISOString() })
        );
      } catch {
        // localStorage full or disabled — silently ignore
      }
    }, 500);
  });
}

export function initPersistence() {
  const existing = localStorage.getItem(AUTOSAVE_KEY);
  if (existing) {
    try {
      hydrateFromRaw(existing);
    } catch {
      hydrateFallback();
    }
  } else {
    hydrateFallback();
  }
  subscribeForAutosave();
}

function hydrateFallback() {
  fetch('/default.siteplan')
    .then((res) => {
      if (!res.ok) throw new Error('not found');
      return res.text();
    })
    .then((raw) => {
      try {
        hydrateFromRaw(raw);
      } catch (err) {
        console.warn('Default site plan failed to load.', err);
      }
    })
    .catch(() => {
      // File not available (e.g. running outside Vite) — keep built-in default
    });
}
