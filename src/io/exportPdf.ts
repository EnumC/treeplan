import { jsPDF } from 'jspdf';
import type {
  SitePlanDocument,
  BoxElement,
  TreeElement,
  TextElement,
  DimensionElement,
  PolyElement,
} from '@/types/document';
import { chromeLayout } from '@/chrome/chromeLayout';
import { buildLegend } from '@/legend/buildLegend';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export async function exportPdf(
  svgEl: SVGSVGElement,
  doc: SitePlanDocument,
  opts: { filename: string }
): Promise<void> {
  const LEDGER_SHORT = 11;
  const LEDGER_LONG = 17;
  const { widthIn, heightIn } = doc.canvas;

  const landscape = widthIn >= heightIn;
  const pageW = landscape ? LEDGER_LONG : LEDGER_SHORT;
  const pageH = landscape ? LEDGER_SHORT : LEDGER_LONG;

  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll('.editor-only').forEach((n) => n.remove());
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('viewBox', `0 0 ${widthIn} ${heightIn}`);

  const dpi = 300;
  const pxW = Math.round(widthIn * dpi);
  const pxH = Math.round(heightIn * dpi);
  clone.setAttribute('width', String(pxW));
  clone.setAttribute('height', String(pxH));
  clone.removeAttribute('style');

  const xml = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = pxW;
    canvas.height = pxH;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pxW, pxH);
    ctx.drawImage(img, 0, 0, pxW, pxH);

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: landscape ? 'landscape' : 'portrait',
      unit: 'in',
      format: [pageW, pageH],
    });

    const scale = Math.min(pageW / widthIn, pageH / heightIn);
    const scaledW = widthIn * scale;
    const scaledH = heightIn * scale;
    const offsetX = (pageW - scaledW) / 2;
    const offsetY = (pageH - scaledH) / 2;

    pdf.addImage(imgData, 'PNG', offsetX, offsetY, scaledW, scaledH);

    addSearchableText(pdf, doc, scale, offsetX, offsetY);

    pdf.save(opts.filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function addSearchableText(
  pdf: jsPDF,
  doc: SitePlanDocument,
  scale: number,
  offsetX: number,
  offsetY: number
): void {
  const { canvas, elements, title, notes } = doc;
  const layout = chromeLayout(canvas);
  const { worldUnitsPerInch } = canvas;

  const worldToPdfX = (wx: number) =>
    (wx / worldUnitsPerInch + layout.drawingArea.x) * scale + offsetX;
  const worldToPdfY = (wy: number) =>
    (wy / worldUnitsPerInch + layout.drawingArea.y) * scale + offsetY;
  const paperToPdfX = (px: number) => px * scale + offsetX;
  const paperToPdfY = (py: number) => py * scale + offsetY;

  pdf.setFont('helvetica');

  for (const el of elements) {
    switch (el.type) {
      case 'text': {
        const te = el as TextElement;
        const pdfX = worldToPdfX(te.x);
        const pdfY = worldToPdfY(te.y);
        const fontSizePt = (te.fontSize / worldUnitsPerInch) * 72 * scale;
        pdf.setFontSize(fontSizePt);
        const align =
          te.align === 'center'
            ? 'center'
            : te.align === 'right'
              ? 'right'
              : 'left';
        pdf.text(te.text, pdfX, pdfY, {
          renderingMode: 'invisible',
          align,
        });
        break;
      }
      case 'box': {
        const be = el as BoxElement;
        if (!be.label) break;
        const cx = be.x + be.w / 2;
        const cy = be.y + be.h / 2;
        const pdfX = worldToPdfX(cx);
        const pdfY = worldToPdfY(cy);
        const labelFontSize = Math.max(Math.min(be.w, be.h) * 0.08, 1.5);
        const fontSizePt = (labelFontSize / worldUnitsPerInch) * 72 * scale;
        pdf.setFontSize(fontSizePt);
        pdf.text(be.label, pdfX, pdfY, { renderingMode: 'invisible', align: 'center' });
        break;
      }
      case 'poly': {
        const pe = el as PolyElement;
        if (!pe.label || pe.points.length < 3) break;
        const xs = pe.points.map((p) => p.x);
        const ys = pe.points.map((p) => p.y);
        const cx = pe.points.reduce((s, p) => s + p.x, 0) / pe.points.length;
        const cy = pe.points.reduce((s, p) => s + p.y, 0) / pe.points.length;
        const bw = Math.max(...xs) - Math.min(...xs);
        const bh = Math.max(...ys) - Math.min(...ys);
        const labelFontSize = Math.max(1.5, Math.min(bw, bh) * 0.08);
        const pdfX = worldToPdfX(cx);
        const pdfY = worldToPdfY(cy);
        const fontSizePt = (labelFontSize / worldUnitsPerInch) * 72 * scale;
        pdf.setFontSize(fontSizePt);
        pdf.text(pe.label, pdfX, pdfY, { renderingMode: 'invisible', align: 'center' });
        break;
      }
      case 'tree': {
        const te = el as TreeElement;
        if (!te.label) break;
        const labelFontSize = Math.max(te.radius * 0.25, 1.5);
        const pdfX = worldToPdfX(te.x);
        const pdfY = worldToPdfY(te.y + te.radius + labelFontSize * 1.2);
        const fontSizePt = (labelFontSize / worldUnitsPerInch) * 72 * scale;
        pdf.setFontSize(fontSizePt);
        pdf.text(te.label, pdfX, pdfY, { renderingMode: 'invisible', align: 'center' });
        break;
      }
      case 'dimension': {
        const de = el as DimensionElement;
        const dx = de.x2 - de.x;
        const dy = de.y2 - de.y;
        const angle = Math.atan2(dy, dx);
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);
        const textOffset = 3.5;
        const mx = (de.x + de.x2) / 2 + perpX * textOffset;
        const my = (de.y + de.y2) / 2 + perpY * textOffset;
        const pdfX = worldToPdfX(mx);
        const pdfY = worldToPdfY(my);
        const fontSizePt = (3.5 / worldUnitsPerInch) * 72 * scale;
        pdf.setFontSize(fontSizePt);
        const lineLen = Math.sqrt(dx * dx + dy * dy);
        const displayLabel = de.label || `${Math.round(lineLen)}'`;
        pdf.text(displayLabel, pdfX, pdfY, {
          renderingMode: 'invisible',
          align: 'center',
        });
        break;
      }
    }
  }

  const tb = layout.titleBlock;
  pdf.setFontSize(0.18 * 1.4 * 72 * scale);
  pdf.text(title.projectName || 'SITE PLAN', paperToPdfX(tb.x + tb.w / 2), paperToPdfY(tb.y + tb.h * 0.22), { renderingMode: 'invisible', align: 'center' });
  pdf.setFontSize(0.18 * 72 * scale);
  pdf.text(title.addressLine1, paperToPdfX(tb.x + tb.w / 2), paperToPdfY(tb.y + tb.h * 0.6), { renderingMode: 'invisible', align: 'center' });
  pdf.text(title.addressLine2, paperToPdfX(tb.x + tb.w / 2), paperToPdfY(tb.y + tb.h * 0.74), { renderingMode: 'invisible', align: 'center' });
  const dateStr = title.date
    ? new Date(title.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  pdf.setFontSize(0.18 * 0.78 * 72 * scale);
  if (dateStr) pdf.text(dateStr, paperToPdfX(tb.x + tb.w * 0.05), paperToPdfY(tb.y + tb.h * 0.9), { renderingMode: 'invisible' });
  if (title.drawnBy) pdf.text(`BY: ${title.drawnBy}`, paperToPdfX(tb.x + tb.w * 0.7), paperToPdfY(tb.y + tb.h * 0.9), { renderingMode: 'invisible' });

  const nb = layout.notes;
  pdf.setFontSize(0.13 * 1.1 * 72 * scale);
  pdf.text(notes.title || 'NOTES', paperToPdfX(nb.x + nb.w / 2), paperToPdfY(nb.y + 0.19), { renderingMode: 'invisible', align: 'center' });
  pdf.setFontSize(0.13 * 0.9 * 72 * scale);
  let curY = nb.y + 0.38;
  const lineH = 0.13 * 1.55;
  const itemGap = 0.13 * 0.9;
  for (let i = 0; i < notes.items.length; i++) {
    const text = `${i + 1}. ${notes.items[i]}`;
    if (curY <= nb.y + nb.h - 0.08) {
      pdf.text(text, paperToPdfX(nb.x + 0.12), paperToPdfY(curY), { renderingMode: 'invisible' });
      curY += lineH + itemGap;
    }
  }

  const legendEntries = buildLegend(doc);
  const lg = layout.legend;
  pdf.setFontSize(0.155 * 1.1 * 72 * scale);
  pdf.text('LEGEND', paperToPdfX(lg.x + lg.w / 2), paperToPdfY(lg.y + 0.18), { renderingMode: 'invisible', align: 'center' });
  pdf.setFontSize(0.155 * 72 * scale);
  const rowH = 0.33;
  for (let i = 0; i < legendEntries.length; i++) {
    const ry = lg.y + 0.38 + i * rowH;
    if (ry + rowH > lg.y + lg.h - 0.1) break;
    pdf.text(legendEntries[i]!.displayName, paperToPdfX(lg.x + 0.5), paperToPdfY(ry + 0.1), { renderingMode: 'invisible' });
  }

  const na = layout.northArrow;
  pdf.setFontSize(Math.min(na.w, na.h) * 0.18 * 72 * scale);
  pdf.text('N', paperToPdfX(na.x + na.w / 2), paperToPdfY(na.y + na.h * 0.15), { renderingMode: 'invisible', align: 'center' });
}
