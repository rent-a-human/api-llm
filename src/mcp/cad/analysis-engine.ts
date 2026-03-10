/**
 * CAD Analysis Engine
 * Handles stress analysis, motion studies, and other CAD simulations
 */

import { OnShapeClient } from './onshape-client';
import { EventEmitter } from 'events';

export interface StressAnalysisRequest {
  documentId: string;
  partId: string;
  materialProperties: any;
  boundaryConditions: any[];
  loadCases: any[];
  meshSettings?: any;
}

export interface MotionAnalysisRequest {
  documentId: string;
  assemblyId: string;
  studyName: string;
  timeRange: number;
  timeSteps: number;
  gravity: number[];
  constraints: any[];
}

export interface AnalysisResult {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress?: number;
  results?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StressAnalysisResults {
  maxVonMisesStress: number;
  maxDisplacement: number;
  minFactorOfSafety: number;
  maxPrincipalStress: number;
  minPrincipalStress: number;
  criticalLocations: Array<{
    location: [number, number, number];
    stress: number;
    displacement: number;
  }>;
  meshInfo: {
    elementCount: number;
    nodeCount: number;
    elementType: string;
  };
}

export interface MotionAnalysisResults {
  rangeOfMotion: {
    x: number;
    y: number;
    z: number;
  };
  velocities: Array<{
    time: number;
    linear: [number, number, number];
    angular: [number, number, number];
  }>;
  accelerations: Array<{
    time: number;
    linear: [number, number, number];
    angular: [number, number, number];
  }>;
  forces: Array<{
    time: number;
    reaction: [number, number, number];
    joint: [number, number, number];
  }>;
  collisions: Array<{
    time: number;
    part1: string;
    part2: string;
    location: [number, number, number];
  }>;
}

export class CADAnalysisEngine extends EventEmitter {
  private onshapeClient: OnShapeClient;
  private activeAnalyses: Map<string, AnalysisResult> = new Map();
  private analysisCounter = 0;

  constructor(onshapeClient: OnShapeClient) {
    super();
    this.onshapeClient = onshapeClient;

    // Listen to client events
    this.onshapeClient.on('document_created', () => {
      this.emit('ready_for_analysis');
    });
  }

  /**
   * Run finite element stress analysis on a part
   */
  async runStressAnalysis(request: StressAnalysisRequest): Promise<AnalysisResult> {
    const analysisId = `stress_${++this.analysisCounter}_${Date.now()}`;

    try {
      // Validate request
      this.validateStressAnalysisRequest(request);

      // Create analysis object
      const analysis: AnalysisResult = {
        id: analysisId,
        status: 'running',
        progress: 0,
        createdAt: new Date().toISOString()
      };

      this.activeAnalyses.set(analysisId, analysis);
      this.emit('analysis_started', { analysisId, type: 'stress' });

      // Run analysis (simulated)
      const results = await this.performStressAnalysis(request, analysisId);

      // Update analysis with results
      analysis.status = 'completed';
      analysis.results = results;
      analysis.completedAt = new Date().toISOString();
      analysis.progress = 100;

      this.activeAnalyses.set(analysisId, analysis);
      this.emit('analysis_completed', { analysisId, results });

      return analysis;
    } catch (error: any) {
      const failedAnalysis: AnalysisResult = {
        id: analysisId,
        status: 'failed',
        error: error.message,
        createdAt: new Date().toISOString()
      };

      this.activeAnalyses.set(analysisId, failedAnalysis);
      this.emit('analysis_failed', { analysisId, error: error.message });

      throw error;
    }
  }

  /**
   * Run motion analysis study on an assembly
   */
  async runMotionAnalysis(request: MotionAnalysisRequest): Promise<AnalysisResult> {
    const analysisId = `motion_${++this.analysisCounter}_${Date.now()}`;

    try {
      // Validate request
      this.validateMotionAnalysisRequest(request);

      // Create analysis object
      const analysis: AnalysisResult = {
        id: analysisId,
        status: 'running',
        progress: 0,
        createdAt: new Date().toISOString()
      };

      this.activeAnalyses.set(analysisId, analysis);
      this.emit('analysis_started', { analysisId, type: 'motion' });

      // Run analysis (simulated)
      const results = await this.performMotionAnalysis(request, analysisId);

      // Update analysis with results
      analysis.status = 'completed';
      analysis.results = results;
      analysis.completedAt = new Date().toISOString();
      analysis.progress = 100;

      this.activeAnalyses.set(analysisId, analysis);
      this.emit('analysis_completed', { analysisId, results });

      return analysis;
    } catch (error: any) {
      const failedAnalysis: AnalysisResult = {
        id: analysisId,
        status: 'failed',
        error: error.message,
        createdAt: new Date().toISOString()
      };

      this.activeAnalyses.set(analysisId, failedAnalysis);
      this.emit('analysis_failed', { analysisId, error: error.message });

      throw error;
    }
  }

  /**
   * Get status of a running analysis
   */
  getAnalysisStatus(analysisId: string): AnalysisResult | null {
    return this.activeAnalyses.get(analysisId) || null;
  }

  /**
   * Cancel a running analysis
   */
  async cancelAnalysis(analysisId: string): Promise<void> {
    const analysis = this.activeAnalyses.get(analysisId);
    if (analysis && analysis.status === 'running') {
      analysis.status = 'failed';
      analysis.error = 'Cancelled by user';
      analysis.completedAt = new Date().toISOString();

      this.activeAnalyses.set(analysisId, analysis);
      this.emit('analysis_cancelled', { analysisId });

      // In a real implementation, this would cancel the actual analysis job
      this.emit('analysis_failed', { analysisId, error: 'Cancelled by user' });
    } else {
      throw new Error('Analysis not found or not running');
    }
  }

  /**
   * List all active analyses
   */
  getActiveAnalyses(): AnalysisResult[] {
    return Array.from(this.activeAnalyses.values()).filter(
      analysis => analysis.status === 'running'
    );
  }

  /**
   * Get analysis history
   */
  getAnalysisHistory(limit: number = 50): AnalysisResult[] {
    return Array.from(this.activeAnalyses.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Private methods

  private validateStressAnalysisRequest(request: StressAnalysisRequest): void {
    if (!request.documentId) {
      throw new Error('Document ID is required');
    }
    if (!request.partId) {
      throw new Error('Part ID is required');
    }
    if (!request.materialProperties) {
      throw new Error('Material properties are required');
    }
    if (!request.boundaryConditions || request.boundaryConditions.length === 0) {
      throw new Error('At least one boundary condition is required');
    }
    if (!request.loadCases || request.loadCases.length === 0) {
      throw new Error('At least one load case is required');
    }

    // Validate material properties
    const requiredMaterialProps = ['youngsModulus', 'poissonsRatio'];
    for (const prop of requiredMaterialProps) {
      if (!(prop in request.materialProperties)) {
        throw new Error(`Material property '${prop}' is required`);
      }
    }
  }

  private validateMotionAnalysisRequest(request: MotionAnalysisRequest): void {
    if (!request.documentId) {
      throw new Error('Document ID is required');
    }
    if (!request.assemblyId) {
      throw new Error('Assembly ID is required');
    }
    if (!request.studyName) {
      throw new Error('Study name is required');
    }
    if (request.timeRange <= 0) {
      throw new Error('Time range must be positive');
    }
    if (request.timeSteps <= 0) {
      throw new Error('Time steps must be positive');
    }
  }

  private async performStressAnalysis(request: StressAnalysisRequest, analysisId: string): Promise<StressAnalysisResults> {
    // Simulate analysis progress
    const progressSteps = [10, 25, 50, 75, 90, 100];

    for (const progress of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const analysis = this.activeAnalyses.get(analysisId);
      if (analysis) {
        analysis.progress = progress;
        this.activeAnalyses.set(analysisId, analysis);
        this.emit('analysis_progress', { analysisId, progress });
      }
    }

    // Calculate realistic stress analysis results
    const material = request.materialProperties;
    const loads = request.loadCases.map(lc => lc.magnitude);
    const maxLoad = Math.max(...loads);

    // Simplified stress calculations (in a real implementation, this would use FEA)
    const maxStress = this.calculateMaxStress(request.partId, maxLoad, material);
    const maxDisplacement = this.calculateMaxDisplacement(request.partId, maxLoad, material);
    const factorOfSafety = this.calculateFactorOfSafety(maxStress, material.yieldStrength || 276);

    return {
      maxVonMisesStress: maxStress,
      maxDisplacement: maxDisplacement,
      minFactorOfSafety: factorOfSafety,
      maxPrincipalStress: maxStress * 1.1,
      minPrincipalStress: maxStress * -0.3,
      criticalLocations: this.generateCriticalLocations(request.partId, maxStress),
      meshInfo: {
        elementCount: Math.floor(Math.random() * 5000) + 1000,
        nodeCount: Math.floor(Math.random() * 8000) + 2000,
        elementType: 'tetrahedral'
      }
    };
  }

  private async performMotionAnalysis(request: MotionAnalysisRequest, analysisId: string): Promise<MotionAnalysisResults> {
    // Simulate analysis progress
    const progressSteps = [15, 30, 45, 60, 75, 90, 100];

    for (const progress of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 600));

      const analysis = this.activeAnalyses.get(analysisId);
      if (analysis) {
        analysis.progress = progress;
        this.activeAnalyses.set(analysisId, analysis);
        this.emit('analysis_progress', { analysisId, progress });
      }
    }

    // Generate realistic motion analysis results
    return {
      rangeOfMotion: {
        x: Math.random() * 180 + 30, // degrees
        y: Math.random() * 120 + 20,
        z: Math.random() * 360 + 180
      },
      velocities: this.generateTimeSeriesData(request.timeSteps, 'velocity'),
      accelerations: this.generateTimeSeriesData(request.timeSteps, 'acceleration'),
      forces: this.generateForceData(request.timeSteps),
      collisions: this.generateCollisionData(request.timeSteps, request.assemblyId)
    };
  }

  private calculateMaxStress(partId: string, load: number, material: any): number {
    // Simplified stress calculation - in reality this would be much more complex
    const geometryFactor = 1.5; // Stress concentration factor
    const crossSectionalArea = Math.PI * Math.pow(10, 2) / 4; // mm² (assuming 10mm diameter)
    const stress = (load * geometryFactor) / crossSectionalArea; // MPa

    return Math.round(stress * 100) / 100;
  }

  private calculateMaxDisplacement(partId: string, load: number, material: any): number {
    // Simplified displacement calculation
    const length = 100; // mm (assuming 100mm long part)
    const crossSectionalArea = Math.PI * Math.pow(10, 2) / 4; // mm²
    const force = load * 9.81; // Convert to N
    const displacement = (force * length) / (material.youngsModulus * crossSectionalArea); // mm

    return Math.round(displacement * 1000) / 1000; // Round to 3 decimal places
  }

  private calculateFactorOfSafety(stress: number, yieldStrength: number): number {
    const factorOfSafety = yieldStrength / stress;
    return Math.round(factorOfSafety * 100) / 100;
  }

  private generateCriticalLocations(partId: string, maxStress: number): Array<{
    location: [number, number, number];
    stress: number;
    displacement: number;
  }> {
    const locations = [];
    const numLocations = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < numLocations; i++) {
      locations.push({
        location: [
          Math.random() * 50 - 25, // x: -25 to 25 mm
          Math.random() * 50 - 25, // y: -25 to 25 mm
          Math.random() * 100      // z: 0 to 100 mm
        ] as [number, number, number],
        stress: maxStress * (0.7 + Math.random() * 0.3), // 70% to 100% of max stress
        displacement: Math.random() * 0.1 + 0.01 // 0.01 to 0.11 mm
      });
    }

    return locations.sort((a, b) => b.stress - a.stress); // Sort by stress descending
  }

  private generateTimeSeriesData(timeSteps: number, dataType: 'velocity' | 'acceleration'): Array<{
    time: number;
    linear: [number, number, number];
    angular: [number, number, number];
  }> {
    const data = [];
    const dt = 1.0 / (timeSteps - 1); // Normalized time step

    for (let i = 0; i < timeSteps; i++) {
      const time = i * dt;

      // Generate realistic motion curves
      const linear: [number, number, number] = [
        Math.sin(time * Math.PI * 2) * (dataType === 'velocity' ? 50 : 100), // mm/s or mm/s²
        Math.cos(time * Math.PI * 2) * 30,
        Math.sin(time * Math.PI * 4) * 20
      ];

      const angular: [number, number, number] = [
        Math.cos(time * Math.PI) * (dataType === 'velocity' ? 180 : 360), // deg/s or deg/s²
        Math.sin(time * Math.PI * 1.5) * 90,
        Math.sin(time * Math.PI * 0.5) * 45
      ];

      data.push({ time, linear, angular });
    }

    return data;
  }

  private generateForceData(timeSteps: number): Array<{
    time: number;
    reaction: [number, number, number];
    joint: [number, number, number];
  }> {
    const data = [];
    const dt = 1.0 / (timeSteps - 1);

    for (let i = 0; i < timeSteps; i++) {
      const time = i * dt;

      // Generate realistic force patterns
      const reaction: [number, number, number] = [
        Math.sin(time * Math.PI * 2) * 100 + 50, // N
        Math.cos(time * Math.PI * 2) * 75,
        Math.random() * 200 + 100 // Always positive (gravity)
      ];

      const joint: [number, number, number] = [
        Math.sin(time * Math.PI * 3) * 50, // N
        Math.cos(time * Math.PI * 2) * 30,
        Math.sin(time * Math.PI) * 25
      ];

      data.push({ time, reaction, joint });
    }

    return data;
  }

  private generateCollisionData(timeSteps: number, assemblyId: string): Array<{
    time: number;
    part1: string;
    part2: string;
    location: [number, number, number];
  }> {
    const data = [];
    const parts = ['part1', 'part2', 'part3', 'part4'];
    const numCollisions = Math.floor(Math.random() * 3); // 0-2 collisions

    for (let i = 0; i < numCollisions; i++) {
      const time = Math.random() * 0.8 + 0.1; // 10% to 90% through simulation
      const part1 = parts[Math.floor(Math.random() * parts.length)];
      let part2 = parts[Math.floor(Math.random() * parts.length)];

      // Ensure part2 is different from part1
      while (part2 === part1) {
        part2 = parts[Math.floor(Math.random() * parts.length)];
      }

      const location: [number, number, number] = [
        Math.random() * 100 - 50, // mm
        Math.random() * 100 - 50,
        Math.random() * 100
      ];

      data.push({ time, part1, part2, location });
    }

    return data.sort((a, b) => a.time - b.time); // Sort by time
  }
}

export default CADAnalysisEngine;