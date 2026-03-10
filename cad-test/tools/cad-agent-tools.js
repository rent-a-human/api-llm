/**
 * This file serves as the bridge between the MCP Server and the CAD testing suite.
 * It exposes functions that the local LLM agent can call to trigger CAD operations.
 * It uses Playwright to drive the underlying CAD software.
 */

import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const CADTools = {
  /**
   * Triggers the authentication flow via Playwright.
   * Prompts the agent if credentials are missing.
   */
  async authenticate() {
    console.log('Agent requested CAD Authentication...');
    try {
      const { stdout } = await execPromise('npx playwright test auth.setup.ts', { cwd: __dirname + '/../' });
      return { success: true, log: stdout };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Instructs the Playwright test suite to execute a customized sketch.
   */
  async createSketch(plane, shapes) {
    console.log(`Agent requested Sketch on plane: ${plane} with shapes:`, shapes);
    // In actual implementation, we pass parameters to the playwright run via ENV vars
    process.env.TEST_PLANE = plane;
    process.env.TEST_SHAPES = JSON.stringify(shapes);
    
    try {
        // Run specific playwright test for create_sketch
        const { stdout } = await execPromise('npx playwright test create_sketch -g "Agent Tool: create_sketch"', { cwd: __dirname + '/../' });
        return { success: true, result: "Sketch successfully drawn.", log: stdout };
    } catch (e) {
        return { success: false, error: e.message };
    }
  },
  
  /**
   * Creates 3D pieces/extrusions from existing sketches.
   */
  async createExtrusion(targetSketch, depth, type = 'add') {
    console.log(`Agent requested Extrusion. Target: ${targetSketch}, Depth: ${depth}, Type: ${type}`);
    process.env.TEST_EXTRUDE_TARGET = targetSketch;
    process.env.TEST_EXTRUDE_DEPTH = depth.toString();
    process.env.TEST_EXTRUDE_TYPE = type;

    try {
        const { stdout } = await execPromise('npx playwright test create_extrusion -g "Agent Tool: create_extrusion"', { cwd: __dirname + '/../' });
        return { success: true, result: `Extrusion (${type}) created successfully at depth ${depth}.`, log: stdout };
    } catch (e) {
        return { success: false, error: e.message };
    }
  }
};
