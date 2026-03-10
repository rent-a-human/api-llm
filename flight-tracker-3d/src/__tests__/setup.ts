import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock WebGL context for Three.js tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  createVertexArray: vi.fn(),
  bindVertexArray: vi.fn(),
  createVertexAttrib: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  createShader: vi.fn(),
  createTexture: vi.fn(),
  activeTexture: vi.fn(),
  bindTexture: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  createFramebuffer: vi.fn(),
  bindFramebuffer: vi.fn(),
  framebufferTexture2D: vi.fn(),
  checkFramebufferStatus: vi.fn(() => true),
  createRenderbuffer: vi.fn(),
  bindRenderbuffer: vi.fn(),
  renderbufferStorage: vi.fn(),
  framebufferRenderbuffer: vi.fn(),
  clear: vi.fn(),
  clearColor: vi.fn(),
  viewport: vi.fn(),
  createVertexArray: vi.fn(),
  useProgram: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  blendFunc: vi.fn(),
  cullFace: vi.fn(),
  depthFunc: vi.fn(),
  canvas: {
    width: 800,
    height: 600,
    style: {}
  } as any,
  drawingBufferWidth: 800,
  drawingBufferHeight: 600,
}));

// Mock resize observer
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Mock WebGL2RenderingContext
const mockWebGL2RenderingContext = {
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  createVertexArray: vi.fn(),
  bindVertexArray: vi.fn(),
  createVertexAttrib: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  createShader: vi.fn(),
  createTexture: vi.fn(),
  activeTexture: vi.fn(),
  bindTexture: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  createFramebuffer: vi.fn(),
  bindFramebuffer: vi.fn(),
  framebufferTexture2D: vi.fn(),
  checkFramebufferStatus: vi.fn(() => true),
  createRenderbuffer: vi.fn(),
  bindRenderbuffer: vi.fn(),
  renderbufferStorage: vi.fn(),
  framebufferRenderbuffer: vi.fn(),
  clear: vi.fn(),
  clearColor: vi.fn(),
  viewport: vi.fn(),
  useProgram: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  blendFunc: vi.fn(),
  cullFace: vi.fn(),
  depthFunc: vi.fn(),
  canvas: {
    width: 800,
    height: 600,
    style: {}
  },
  drawingBufferWidth: 800,
  drawingBufferHeight: 600,
};

// Mock document.createElement to return canvas with webgl2 context
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName) => {
  if (tagName === 'canvas') {
    const canvas = originalCreateElement(tagName);
    canvas.getContext = vi.fn((contextType) => {
      if (contextType === 'webgl2') {
        return mockWebGL2RenderingContext;
      }
      return null;
    });
    return canvas;
  }
  return originalCreateElement(tagName);
});

// Suppress console warnings during tests
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
    return;
  }
  originalError.call(console, ...args);
};