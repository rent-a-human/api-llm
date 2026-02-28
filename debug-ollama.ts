import * as ollamaImport from 'ollama';

console.log('Exports:', Object.keys(ollamaImport));
try {
    console.log('Default:', ollamaImport.default);
    const O = ollamaImport.default as any;
    if (typeof O === 'function') {
        console.log('Default is a function/class');
    } else {
        console.log('Default is an object/instance');
    }
} catch (e) {
    console.log('Error inspecting default:', e);
}
