import { createCanvas } from 'canvas';
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

export interface PdfAnalysisResult {
    text: string;
    images?: string[]; // Base64 jpeg images if scanned fallback triggered
    isScanned: boolean;
}

export async function extractPdfPayload(buffer: Buffer, maxPagesToRender: number = 3): Promise<PdfAnalysisResult> {
    const dataArray = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({ data: dataArray });
    const pdfDoc = await loadingTask.promise;

    let fullText = '';
    const pageImages: string[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';

        // Rasterize the first few pages
        if (i <= maxPagesToRender) {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            await page.render({
                canvasContext: context as any,
                viewport: viewport
            }).promise;

            // Remove the data:image/jpeg;base64, prefix for raw LLM consumption
            const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            pageImages.push(base64Data);
        }
    }

    // Density check: if there are very few characters per page on average, it's likely a scan/image PDF
    const charsPerPage = fullText.trim().length / pdfDoc.numPages;
    const isScanned = charsPerPage < 50;

    return {
        text: isScanned ? "⚠️ This PDF appears to be a scanned document. See attached visual pages." : fullText,
        images: isScanned ? pageImages : undefined,
        isScanned
    };
}
