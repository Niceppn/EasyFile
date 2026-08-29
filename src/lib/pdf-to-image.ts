import JSZip from 'jszip';

export interface PdfToImageOptions {
  format: 'jpeg' | 'png' | 'webp';
  scale?: number; // e.g. 1.5 for 150 DPI, 2.5 for 300 DPI
  onProgress?: (progress: number, status: string) => void;
}

export interface ConvertedPage {
  pageNum: number;
  dataUrl: string;
  blob: Blob;
  fileName: string;
}

export interface PdfToImageResult {
  pages: ConvertedPage[];
  zipBlob: Blob;
  zipFileName: string;
}

export async function convertPdfToImages(
  file: File,
  options: PdfToImageOptions
): Promise<PdfToImageResult> {
  const { format, scale = 2.0, onProgress } = options;
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(10, 'กำลังโหลดและวิเคราะห์ไฟล์ PDF...');

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    typeof window !== 'undefined'
      ? `${window.location.origin}/pdf.worker.min.mjs`
      : '/pdf.worker.min.mjs';

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfJsDoc = await loadingTask.promise;
  const numPages = pdfJsDoc.numPages;

  const pages: ConvertedPage[] = [];
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, '');
  const ext = format === 'jpeg' ? 'jpg' : format;

  for (let i = 1; i <= numPages; i++) {
    const pct = 10 + Math.round((i / numPages) * 80);
    onProgress?.(pct, `กำลังแปลงหน้า ${i}/${numPages} เป็นภาพ .${ext.toUpperCase()}...`);

    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    await page.render({ canvasContext: context, canvas, viewport }).promise;

    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);

    const blob = await fetch(dataUrl).then((res) => res.blob());
    const fileName = `${baseName}_page_${i}.${ext}`;

    pages.push({
      pageNum: i,
      dataUrl,
      blob,
      fileName,
    });

    zip.file(fileName, blob);
  }

  onProgress?.(95, 'กำลังสร้างไฟล์ ZIP รวมทุกหน้า...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFileName = `${baseName}_images.zip`;

  onProgress?.(100, 'แปลง PDF เป็นรูปภาพเรียบร้อยแล้ว!');

  return {
    pages,
    zipBlob,
    zipFileName,
  };
}
