function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export async function exportPng(
  svgEl: SVGSVGElement,
  opts: {
    dpi: number;
    paperWidthIn: number;
    paperHeightIn: number;
    filename: string;
  }
): Promise<void> {
  // 1. Clone the live SVG
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // 2. Strip editor-only elements
  clone.querySelectorAll('.editor-only').forEach((n) => n.remove());

  // 3. Set explicit xmlns + paper dimensions in pixels for the raster step
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // Keep the viewBox; set explicit width/height for the raster canvas size
  const pxW = Math.round(opts.paperWidthIn * opts.dpi);
  const pxH = Math.round(opts.paperHeightIn * opts.dpi);
  clone.setAttribute('width', String(pxW));
  clone.setAttribute('height', String(pxH));
  clone.removeAttribute('style');

  // 4. Serialize
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

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('canvas.toBlob failed'));
      }, 'image/png');
    });

    // Trigger download
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = dlUrl;
    a.download = opts.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(dlUrl);
  } finally {
    URL.revokeObjectURL(url);
  }
}
