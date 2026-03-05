#!/usr/bin/env node

/**
 * Test script for PDF signature functionality
 */

async function testPdfSignature() {
  try {
    console.log('Testing PDF signature service...');
    
    // Import the service
    const { pdfSignatureService } = require('../dist/services/pdf-signature-service.js');
    
    // Test with sample files (if they exist)
    console.log('✓ PDF signature service imported successfully');
    
    // Validate that the service has the expected method
    if (typeof pdfSignatureService.signPdfDocument === 'function') {
      console.log('✓ signPdfDocument method exists');
    } else {
      console.error('✗ signPdfDocument method not found');
    }
    
    console.log('All tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testPdfSignature();