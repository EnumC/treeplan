import type { SitePlanDocument } from '@/types/document';

export const CURRENT_SCHEMA_VERSION = 2 as const;

type Migrator = (doc: Record<string, unknown>) => Record<string, unknown>;
const MIGRATIONS: Record<number, Migrator> = {
  1: (doc) => ({
    ...doc,
    schemaVersion: 2,
    notes: {
      ...(doc['notes'] as Record<string, unknown>),
      items: [
        'REFER TO LOCAL OR REGIONAL SURVEY STANDARDS.',
        'IT IS THE RESPONSIBILITY OF THE READER TO CONFIRM ALL MEASUREMENTS.',
      ],
    },
  }),
};

export function migrate(raw: unknown): SitePlanDocument {
  if (typeof (raw as Record<string, unknown>)?.schemaVersion !== 'number') {
    throw new Error('Not a .siteplan file: missing schemaVersion');
  }
  let doc = raw as Record<string, unknown>;
  while ((doc['schemaVersion'] as number) < CURRENT_SCHEMA_VERSION) {
    const version = doc['schemaVersion'] as number;
    const m = MIGRATIONS[version];
    if (!m) throw new Error(`No migrator for v${version}`);
    doc = m(doc);
  }
  const version = doc['schemaVersion'] as number;
  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `File is newer (v${version}) than this app (v${CURRENT_SCHEMA_VERSION}). Update the app.`
    );
  }
  return doc as unknown as SitePlanDocument;
}
