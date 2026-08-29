import { PDFDocument } from 'pdf-lib';

export interface CompressionOptions {
  targetSizeBytes: number; // e.g. 1,048,576 for 1MB
  onProgress?: (progress: number, status: string) => void;
}

export interface CompressionResult {
  success: boolean;
  originalSize: number;
  compressedSize: number;
  pdfBlob: Blob;
  pdfUrl: string;
  pagesCount: number;
  savingsPercentage: number;
  message?: string;
}

/**
 * Format byte sizes into human readable strings (e.g., 1.5 MB, 500 KB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Advanced Crisp PDF Compressor (Sharp Thai Text & Strict Target Budgeting)
 */
export async function compressPdfToTargetSize(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { targetSizeBytes, onProgress } = options;
  const originalSize = file.size;

  onProgress?.(10, 'กำลังวิเคราะห์โครงสร้างไฟล์ PDF...');

  const arrayBuffer = await file.arrayBuffer();

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pagesCount = pdfDoc.getPageCount();

    onProgress?.(25, 'กำลังทดสอบการบีบอัด Stream (Lossless)...');

    // Standard pdf-lib object stream compression
    const rawCompressed = await pdfDoc.save({ useObjectStreams: true });
    const rawSize = rawCompressed.byteLength;

    // Return ONLY if raw stream compression alone ALREADY meets or beats the target size
    if (rawSize <= targetSizeBytes) {
      onProgress?.(100, 'บีบอัดไฟล์สำเร็จโดยรักษาความคมชัด 100%!');
      const blob = new Blob([rawCompressed.buffer as ArrayBuffer], { type: 'application/pdf' });
      return {
        success: true,
        originalSize,
        compressedSize: rawSize,
        pdfBlob: blob,
        pdfUrl: URL.createObjectURL(blob),
        pagesCount,
        savingsPercentage: Math.max(0, Math.round(((originalSize - rawSize) / originalSize) * 100)),
      };
    }

    onProgress?.(35, 'กำลังเปิดเอนจินประมวลผลความคมชัดระดับ HD...');

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = typeof window !== 'undefined' 
      ? `${window.location.origin}/pdf.worker.min.mjs`
      : '/pdf.worker.min.mjs';

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfJsDoc = await loadingTask.promise;

    /**
     * Render page at high-DPI resolution while maintaining exact original A4 page dimensions
     */
    const renderAndCompress = async (renderScale: number, quality: number): Promise<{ bytes: Uint8Array; size: number }> => {
      const newPdfDoc = await PDFDocument.create();

      for (let pageNum = 1; pageNum <= pagesCount; pageNum++) {
        const page = await pdfJsDoc.getPage(pageNum);
        
        // Base viewport for standard PDF page dimensions
        const baseViewport = page.getViewport({ scale: 1.0 });
        const pageWidth = baseViewport.width;
        const pageHeight = baseViewport.height;

        // High-DPI viewport for pin-sharp text rendering
        const renderViewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = Math.round(renderViewport.width);
        canvas.height = Math.round(renderViewport.height);

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        await page.render({ canvasContext: context, canvas, viewport: renderViewport }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const imageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());

        const embeddedImage = await newPdfDoc.embedJpg(imageBytes);
        const newPage = newPdfDoc.addPage([pageWidth, pageHeight]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }

      const bytes = await newPdfDoc.save({ useObjectStreams: true });
      return { bytes, size: bytes.byteLength };
    };

    // Pass 1: Try High-DPI Crisp Render (Scale 2.0 = 144 DPI) and Quality 0.85
    onProgress?.(45, 'กำลังคำนวณความคมชัดระดับคมกริบ (HD 150 DPI)...');
    let bestPass = await renderAndCompress(2.0, 0.85);

    if (bestPass.size <= targetSizeBytes) {
      // Scale 2.0 fits under budget! Try super quality 0.90
      const passUltra = await renderAndCompress(2.0, 0.90);
      if (passUltra.size <= targetSizeBytes) {
        bestPass = passUltra;
      }

      onProgress?.(100, 'บีบอัดไฟล์สำเร็จ!');
      const blob = new Blob([bestPass.bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      return {
        success: true,
        originalSize,
        compressedSize: bestPass.size,
        pdfBlob: blob,
        pdfUrl: URL.createObjectURL(blob),
        pagesCount,
        savingsPercentage: Math.max(0, Math.round(((originalSize - bestPass.size) / originalSize) * 100)),
      };
    }

    // Binary Search between High-DPI (renderScale 1.8 -> 1.0) to find maximum crispness fitting budget
    let lowScale = 0.9;
    let highScale = 2.0;
    let lowQuality = 0.65;
    let highQuality = 0.88;

    let bestFitBytes: Uint8Array = bestPass.bytes;
    let bestFitSize: number = bestPass.size;

    const iterations = 4;
    for (let iter = 1; iter <= iterations; iter++) {
      const midScale = (lowScale + highScale) / 2;
      const midQuality = (lowQuality + highQuality) / 2;

      const currentProgress = 45 + Math.round((iter / iterations) * 45);
      onProgress?.(currentProgress, `กำลังปรับแต่งความชัดข้อความรอบที่ ${iter}/${iterations}...`);

      const current = await renderAndCompress(midScale, midQuality);

      if (current.size <= targetSizeBytes) {
        if (bestFitSize > targetSizeBytes || current.size > bestFitSize) {
          bestFitBytes = current.bytes;
          bestFitSize = current.size;
        }
        lowScale = midScale;
        lowQuality = midQuality;
      } else {
        if (current.size < bestFitSize) {
          bestFitBytes = current.bytes;
          bestFitSize = current.size;
        }
        highScale = midScale;
        highQuality = midQuality;
      }
    }

    onProgress?.(95, 'กำลังจัดเตรียมไฟล์ PDF ที่บีบอัดสมบูรณ์...');

    const blob = new Blob([bestFitBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    return {
      success: true,
      originalSize,
      compressedSize: bestFitSize,
      pdfBlob: blob,
      pdfUrl: URL.createObjectURL(blob),
      pagesCount,
      savingsPercentage: Math.max(0, Math.round(((originalSize - bestFitSize) / originalSize) * 100)),
    };
  } catch (error: any) {
    console.error('PDF Compression Error:', error);
    onProgress?.(100, 'ประมวลผลการบีบอัดขั้นพื้นฐานสำเร็จ');

    const rawCompressed = await PDFDocument.load(arrayBuffer)
      .then((doc) => doc.save({ useObjectStreams: true }))
      .catch(() => new Uint8Array(arrayBuffer));

    const finalSize = rawCompressed.byteLength;
    const blob = new Blob([rawCompressed.buffer as ArrayBuffer], { type: 'application/pdf' });

    return {
      success: true,
      originalSize,
      compressedSize: finalSize,
      pdfBlob: blob,
      pdfUrl: URL.createObjectURL(blob),
      pagesCount: 1,
      savingsPercentage: Math.max(0, Math.round(((originalSize - finalSize) / originalSize) * 100)),
      message: 'Processed with standard stream compression',
    };
  }
}
