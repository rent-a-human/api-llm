import fs from 'fs';
import path from 'path';

// Load Node Canvas to provide DOM elements to PDF.js
import { createCanvas } from 'canvas';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
const pdfjs = pdfjsLib.default || pdfjsLib;

async function testPdfHybrid(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const dataBuffer = fs.readFileSync(filePath);
    const dataArray = new Uint8Array(dataBuffer);

    console.log("Loading PDF...");
    const loadingTask = pdfjs.getDocument({ data: dataArray });
    const pdfDoc = await loadingTask.promise;
    
    console.log(`Document loaded. Pages: ${pdfDoc.numPages}`);
    
    let fullText = '';
    const MAX_PAGES_TO_RENDER = 3;
    const pageImages = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
        
        // Rasterize the first few pages just to test Image generation
        if (i <= MAX_PAGES_TO_RENDER) {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // Remove the data:image/jpeg;base64, prefix for raw LLM consumption
            const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            pageImages.push(base64Data);
        }
    }
    
    const charsPerPage = fullText.length / pdfDoc.numPages;
    const isScanned = true; // Force true for testing canvas

    console.log(`\nAverage Characters per Page: ${Math.round(charsPerPage)}`);
    console.log(isScanned ? "⚠️ Scanned document detected! Falling back to Vision OCR." : "✅ High text density detected. Using standard text.");
    
    if (isScanned) {
        console.log(`Fallback: Returning ${pageImages.length} images for Visual OCR.`);
        console.log(`Preview Image 1 Length: ${pageImages[0].length}`);
    } else {
        console.log("Extracted  the Text Preview:", fullText.slice(0, 500) + "...");
    }
}

const file = path.resolve('demo.pdf');
testPdfHybrid(file).catch(console.error);
