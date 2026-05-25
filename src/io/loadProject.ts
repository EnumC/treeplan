import type { SitePlanDocument } from '@/types/document';
import { migrate } from './migrations';

export async function loadProjectFromFile(file: File): Promise<SitePlanDocument> {
  const text = await file.text();
  const raw: unknown = JSON.parse(text);
  return migrate(raw);
}
