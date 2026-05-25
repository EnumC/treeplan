import type { SitePlanDocument } from '@/types/document';

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'site-plan';
}

export function serializeProject(doc: SitePlanDocument): string {
  return JSON.stringify({ ...doc, updatedAt: new Date().toISOString() }, null, 2);
}

export function downloadProject(doc: SitePlanDocument, filename?: string) {
  const name = filename ?? `${slug(doc.title.projectName || 'site-plan')}.siteplan`;
  const blob = new Blob([serializeProject(doc)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
