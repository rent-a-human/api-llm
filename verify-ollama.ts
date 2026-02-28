import { Ollama } from 'ollama';

try {
    const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
    console.log("Successfully imported and instantiated Ollama class.");
} catch (e) {
    console.log("Failed to import Ollama class. Error: " + e);
    try {
        // Try default import
        const ollama = require('ollama').default;
        const o = new ollama({ host: 'http://127.0.0.1:11434' });
        console.log("Successfully imported via require default.");
    } catch (e2) {
        console.log("Failed require default: " + e2);
    }
}
