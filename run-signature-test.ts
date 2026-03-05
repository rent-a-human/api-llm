import { executeBackendTool } from './src/mcp/server';

async function testSign() {
    console.log("Starting PDF signature test...");

    const result = await executeBackendTool("sign_pdf_document", {
        pdfFile: "test.pdf",
        signerName: "JOHN LENIN ORTIZ",
        signatureImage: "signature-john.png"
    });

    console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
    testSign().catch(console.error);
}
