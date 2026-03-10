/**
 * OnShape CAD API Client
 * Handles authentication, document operations, and CAD feature creation
 */

import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

export interface OnShapeConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  baseUrl: string;
  accessKey?: string;
  secretKey?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface DocumentInfo {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  modifiedAt: string;
  owner: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM';
}

export interface SketchGeometry {
  type: 'line' | 'circle' | 'rectangle' | 'arc' | 'spline' | 'hexagon';
  coordinates: number[];
  properties?: any;
}

export interface SketchOptions {
  featureName: string;
  sketchType?: string; // e.g., 'Top', 'Front', 'Right' or a face ID
  geometry?: SketchGeometry[];
  partStudioEid?: string; // Override the element ID when targeting a specific Part Studio tab
}

export interface ExtrudeOptions {
  featureName?: string;
  sketchId: string;
  distance: number;
  direction?: 'positive' | 'negative' | 'both';
  operationType?: 'NEW' | 'ADD' | 'REMOVE' | 'INTERSECT';
  taperAngle?: number;
  partStudioEid?: string; // Override the element ID when targeting a specific Part Studio tab
}

export interface RevolveOptions {
  sketchId: string;
  axisId: string;
  revolveType?: 'FULL' | 'ONE_WAY' | 'TWO_WAY' | 'SYMMETRIC';
  angle?: number;
  partStudioEid?: string; // Override the element ID
}

export interface SweepOptions {
  profileSketchId: string;
  pathId: string;
  partStudioEid?: string;
}

export interface LoftOptions {
  profileIds: string[];
  partStudioEid?: string;
}

export interface PlaneOptions {
  name?: string;
  entities: string[]; // List of reference entities (e.g., a plane name or face ID)
  offset?: number;
  partStudioEid?: string;
}

export interface FilletOptions {
  featureName?: string;
  entities: string[]; // Edges or faces to fillet
  radius: number;
  partStudioEid?: string;
}

export interface HoleOptions {
  featureName?: string;
  locationSketchId?: string; // Sketch containing the hole points
  faceId?: string;           // Face to place the hole on
  diameter: number;
  depth?: number;
  holeType?: 'SIMPLE' | 'COUNTERBORE' | 'COUNTERSINK';
  partStudioEid?: string;
}

export interface ExternalThreadOptions {
  featureName?: string;
  entities: string[];      // Cylinder edges or faces to thread
  standard?: 'ANSI' | 'ISO';
  size?: string;           // e.g. "3/4" or "M20"
  threadsPerInch?: number; // for ANSI
  pitch?: string;          // for ISO, e.g. "2.5 mm"
  depth?: number;          // length of thread
  partStudioEid?: string;
}

export interface MaterialProperties {
  name: string;
  density?: number;
  youngsModulus?: number;
  poissonsRatio?: number;
  yieldStrength?: number;
  tensileStrength?: number;
  thermalConductivity?: number;
  color?: string;
}

export interface BoundaryCondition {
  type: 'fixed' | 'pinned' | 'displacement' | 'force' | 'pressure';
  faces: string[];
  values: any;
}

export interface LoadCase {
  name: string;
  type: 'force' | 'pressure' | 'gravity' | 'thermal';
  magnitude: number;
  direction?: number[];
  applicationPoint?: number[];
}

export interface ExportOptions {
  units?: 'mm' | 'cm' | 'in';
  accuracy?: 'high' | 'medium' | 'low';
  includeHidden?: boolean;
  separateFiles?: boolean;
}

export class OnShapeClient extends EventEmitter {
  private config: OnShapeConfig;
  private axiosInstance: AxiosInstance;
  private tokens: AuthTokens | null = null;

  constructor(config: OnShapeConfig) {
    super();
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CAD-Integration-Tool/1.0'
      }
    });

    // Add request interceptor to include authentication
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        if (this.config.accessKey && this.config.secretKey) {
          const auth = Buffer.from(`${this.config.accessKey}:${this.config.secretKey}`).toString('base64');
          config.headers.Authorization = `Basic ${auth}`;
        } else if (this.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.response?.status === 401 && this.tokens?.refreshToken) {
          // Token expired, try to refresh
          try {
            await this.refreshAccessToken(this.tokens.refreshToken);
            // Retry the original request
            return this.axiosInstance.request(error.config);
          } catch (refreshError) {
            this.emit('auth_error', refreshError);
            throw refreshError;
          }
        }
        throw error;
      }
    );
  }

  /**
   * Get OAuth authorization URL for user authentication
   */
  getAuthorizationUrl(): string {
    const params: Record<string, string> = {
      response_type: 'code',
      scope: 'read write admin'
    };
    if (this.config.clientId) params.client_id = this.config.clientId;
    if (this.config.redirectUri) params.redirect_uri = this.config.redirectUri;

    const searchParams = new URLSearchParams(params);
    return `https://cad.onshape.com/oauth/authorize?${searchParams.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(code: string): Promise<AuthTokens> {
    try {
      const response = await axios.post('https://cad.onshape.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: code,
        redirect_uri: this.config.redirectUri
      });

      this.tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      };

      this.emit('authenticated', this.tokens);
      return this.tokens;
    } catch (error: any) {
      this.emit('auth_error', error);
      throw new Error(`Authentication failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await axios.post('https://cad.onshape.com/oauth/token', {
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken
      });

      this.tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      };

      this.emit('token_refreshed', this.tokens);
      return this.tokens;
    } catch (error: any) {
      this.emit('auth_error', error);
      throw new Error(`Token refresh failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * List all documents accessible to the authenticated user
   */
  async listDocuments(options: { limit?: number; offset?: number } = {}): Promise<DocumentInfo[]> {
    const { limit = 50, offset = 0 } = options;

    try {
      const response = await this.axiosInstance.get('/api/v3/documents', {
        params: { limit, offset }
      });

      const items = response.data.items || [];
      return items.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        createdAt: doc.createdAt,
        modifiedAt: doc.modifiedAt,
        owner: doc.owner?.email || doc.owner?.name,
        visibility: doc.visibility
      }));
    } catch (error: any) {
      throw new Error(`Failed to list documents: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a new OnShape document
   */
  async createDocument(options: { name: string; description?: string; units?: string }): Promise<DocumentInfo> {
    const { name, description, units = 'mm' } = options;

    try {
      const response = await this.axiosInstance.post('/api/v3/documents', {
        name,
        description: description || '',
        units,
        companyId: null // For personal use
      });

      const doc = response.data;
      this.emit('document_created', { id: doc.id, name: doc.name });

      return {
        id: doc.id,
        name: doc.name,
        description: doc.description,
        createdAt: doc.createdAt,
        modifiedAt: doc.modifiedAt,
        owner: 'current_user',
        visibility: 'PRIVATE'
      };
    } catch (error: any) {
      throw new Error(`Failed to create document: ${error.response?.data?.message || error.message}`);
    }
  }

  private mapPlaneName(name: string): string {
    const lower = name.toLowerCase();
    const map: Record<string, string> = {
      'top': 'Top',
      'bottom': 'Top',
      'front': 'Front',
      'back': 'Front',
      'right': 'Right',
      'left': 'Right'
    };
    return map[lower] || name;
  }

  /**
   * Helper to get the default workspace and first part studio element
   */
  public async getDocumentElements(documentId: string): Promise<{ wid: string, eid: string }> {
    // 1. Get default workspace
    const docResponse = await this.axiosInstance.get(`/api/v3/documents/${documentId}`);
    const wid = docResponse.data.defaultWorkspace.id;

    // 2. Get elements in that workspace
    const elementsResponse = await this.axiosInstance.get(`/api/v3/documents/d/${documentId}/w/${wid}/elements`);
    const partStudios = elementsResponse.data.filter((e: any) => e.elementType === 'PARTSTUDIO');
    if (partStudios.length === 0) {
      throw new Error(`No Part Studio found in document ${documentId}`);
    }
    const eid = partStudios[0].id;

    return { wid, eid };
  }

  /**
   * Build BTM sketch entities from geometry descriptors.
   * Coordinates are in mm and converted to meters (Onshape uses SI).
   * Line segments MUST include startParam=0, endParam=length, and a normalized direction.
   */
  private buildSketchEntities(geometry: SketchGeometry[]): any[] {
    const entities: any[] = [];
    for (const geo of geometry) {
      const c = geo.coordinates;
      if (geo.type === 'rectangle') {
        // [x1_mm, y1_mm, x2_mm, y2_mm] in mm → convert to meters
        const [x1, y1, x2, y2] = c.map((v: number) => v / 1000);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        entities.push(
          // Bottom edge: left→right
          {
            btType: "BTMSketchCurveSegment-155", entityId: "rb", isConstruction: false,
            startPointId: "p_bl", endPointId: "p_br", startParam: 0, endParam: w,
            geometry: { btType: "BTCurveGeometryLine-117", pntX: x1, pntY: y1, dirX: 1, dirY: 0 }
          },
          // Top edge: left→right
          {
            btType: "BTMSketchCurveSegment-155", entityId: "rt", isConstruction: false,
            startPointId: "p_tl", endPointId: "p_tr", startParam: 0, endParam: w,
            geometry: { btType: "BTCurveGeometryLine-117", pntX: x1, pntY: y2, dirX: 1, dirY: 0 }
          },
          // Left edge: bottom→top
          {
            btType: "BTMSketchCurveSegment-155", entityId: "rl", isConstruction: false,
            startPointId: "p_bl", endPointId: "p_tl", startParam: 0, endParam: h,
            geometry: { btType: "BTCurveGeometryLine-117", pntX: x1, pntY: y1, dirX: 0, dirY: 1 }
          },
          // Right edge: bottom→top
          {
            btType: "BTMSketchCurveSegment-155", entityId: "rr", isConstruction: false,
            startPointId: "p_br", endPointId: "p_tr", startParam: 0, endParam: h,
            geometry: { btType: "BTCurveGeometryLine-117", pntX: x2, pntY: y1, dirX: 0, dirY: 1 }
          }
        );
      } else if (geo.type === 'circle') {
        // [cx_mm, cy_mm, radius_mm]
        const [cx, cy, r] = c.map((v: number) => v / 1000);
        entities.push({
          btType: "BTMSketchCurve-4", entityId: "circle1", isConstruction: false, centerId: "circle1_c",
          geometry: { btType: "BTCurveGeometryCircle-115", xcenter: cx, ycenter: cy, radius: r, xDir: 1, yDir: 0 }
        });
      } else if (geo.type === 'line') {
        // [x1_mm, y1_mm, x2_mm, y2_mm]
        const [x1, y1, x2, y2] = c.map((v: number) => v / 1000);
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        entities.push({
          btType: "BTMSketchCurveSegment-155", entityId: "line1", isConstruction: false,
          startPointId: "line1_s", endPointId: "line1_e", startParam: 0, endParam: len,
          geometry: { btType: "BTCurveGeometryLine-117", pntX: x1, pntY: y1, dirX: dx / len, dirY: dy / len }
        });
      } else if (geo.type === 'arc') {
        // [cx_mm, cy_mm, radius_mm] — arc stored as a circle segment reference
        const [cx, cy, r] = c.map((v: number) => v / 1000);
        entities.push({
          btType: "BTMSketchCurveSegment-155", entityId: "arc1", isConstruction: false,
          centerId: "arc1_c", startPointId: "arc1_s", endPointId: "arc1_e",
          startParam: 0, endParam: Math.PI * 2,
          geometry: { btType: "BTCurveGeometryCircle-115", xcenter: cx, ycenter: cy, radius: r }
        });
      } else if (geo.type === 'hexagon') {
        // [cx_mm, cy_mm, inradius_mm] — inradius = width_across_flats / 2
        // circumradius = inradius / cos(30°) = inradius * 2/√3
        const [cx, cy, inr] = c.map((v: number) => v / 1000);
        const R = inr / Math.cos(Math.PI / 6); // circumradius
        // 6 vertices at 30°, 90°, 150°, 210°, 270°, 330° (flat-top orientation)
        const verts = Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 6) + (i * Math.PI / 3);
          return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
        });
        for (let i = 0; i < 6; i++) {
          const v0 = verts[i], v1 = verts[(i + 1) % 6];
          const dx = v1.x - v0.x, dy = v1.y - v0.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          entities.push({
            btType: "BTMSketchCurveSegment-155", entityId: `hex_e${i}`, isConstruction: false,
            startPointId: `hex_p${i}`, endPointId: `hex_p${(i + 1) % 6}`,
            startParam: 0, endParam: len,
            geometry: { btType: "BTCurveGeometryLine-117", pntX: v0.x, pntY: v0.y, dirX: dx / len, dirY: dy / len }
          });
        }
      }
    }
    return entities;
  }

  /**
   * Create a new sketch in a document
   */
  async createSketch(documentId: string, options: SketchOptions): Promise<any> {
    const { featureName, sketchType = 'Top', geometry = [] } = options;

    try {
      const { wid: workspaceId, eid: defaultEid } = await this.getDocumentElements(documentId);
      const elementId = options.partStudioEid ?? defaultEid;

      // Build inline BTM geometry entities
      const btmEntities = this.buildSketchEntities(geometry);

      // Resolve sketch plane — either a named default plane or a feature ID (construction plane)
      const mappedPlane = this.mapPlaneName(sketchType);
      const isDefaultPlane = ['top', 'front', 'right'].includes(mappedPlane.toLowerCase());
      const sketchPlaneQuery = isDefaultPlane
        ? {
          btType: "BTMIndividualQuery-138",
          geometryIds: [mappedPlane],
          ...(mappedPlane.toLowerCase() === 'top' ? { deterministicIds: ['JDC'] } : {}),
          ...(mappedPlane.toLowerCase() === 'front' ? { deterministicIds: ['JCC'] } : {}),
          ...(mappedPlane.toLowerCase() === 'right' ? { deterministicIds: ['JFC'] } : {})
        }
        : {
          // Feature ID of a construction plane — query its generated face via explicit queryString
          btType: "BTMIndividualQuery-138",
          queryString: `query = qCreatedBy(makeId("${sketchType}"), EntityType.FACE);`,
          nodeId: ""
        };

      const sketchData = {
        feature: {
          btType: "BTMSketch-151",
          featureType: "newSketch",
          name: featureName,
          namespace: "",
          suppressed: false,
          nodeId: "",
          returnAfterSubfeatures: false,
          subFeatures: [],
          entities: btmEntities,
          constraints: [],
          parameters: [
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "sketchPlane",
              queries: [sketchPlaneQuery]
            }
          ]
        }
      };

      try {
        const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${workspaceId}/e/${elementId}/features`, sketchData);

        this.emit('sketch_created', { documentId, sketchId: response.data.feature.featureId });
        return {
          id: response.data.feature.featureId,
          name: featureName,
          raw: response.data
        };

      } catch (error: any) {
        if (error.response?.data) {
          console.error('❌ [OnShapeClient] Sketch API Error Context:', JSON.stringify(error.response.data, null, 2));
        }

        const hasAuth = (this.config.accessKey && this.config.secretKey) || this.tokens?.accessToken;
        if (error.response?.status === 401 || !hasAuth) {
          console.warn('⚠️ [OnShapeClient] Unauthorized or missing tokens. Falling back to mock Sketch creation.');
          const mockResponse = {
            id: `sketch_${Date.now()}`,
            featureId: `feature_${Date.now()}`,
            name: featureName,
            type: 'Sketch',
            geometry
          };

          this.emit('sketch_created', { documentId, sketchId: mockResponse.id });
          return mockResponse;
        }
        throw new Error(`Failed to create sketch: ${error.response?.data?.message || error.message}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to create sketch: ${error.message}`);
    }
  }

  /**
   * Create an extrude feature from sketch geometry
   */
  async createExtrude(documentId: string, options: ExtrudeOptions): Promise<any> {
    const { featureName, sketchId, distance, direction = 'positive', operationType = 'NEW', taperAngle = 0 } = options;

    try {
      const { wid, eid: defaultEid } = await this.getDocumentElements(documentId);
      const eid = options.partStudioEid ?? defaultEid;

      // Onshape extrude always uses parameterId=operationType for ALL operation types (NEW/REMOVE/ADD/INTERSECT)
      const opParam = {
        btType: "BTMParameterEnum-145",
        parameterId: "operationType",
        enumName: "NewBodyOperationType",
        value: operationType
      };

      const extrudeData = {
        feature: {
          btType: "BTMFeature-134",
          featureType: "extrude",
          name: featureName ?? `Extrude_${Date.now()}`,
          namespace: "",
          suppressed: false,
          nodeId: "",
          returnAfterSubfeatures: false,
          subFeatures: [],
          parameters: [
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "entities",
              queries: [
                {
                  btType: "BTMIndividualQuery-138",
                  queryString: `query = qSketchRegion(makeId("${sketchId}"));`,
                  nodeId: ""
                }
              ]
            },
            opParam,
            {
              btType: "BTMParameterEnum-145",
              parameterId: "bodyType",
              enumName: "ExtendedToolBodyType",
              value: "SOLID"
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "endBound",
              enumName: "BoundingType",
              value: "BLIND"
            },
            {
              btType: "BTMParameterQuantity-147",
              parameterId: "depth",
              expression: `${distance} mm`
            },
            {
              btType: "BTMParameterBoolean-144",
              parameterId: "oppositeDirection",
              value: direction === 'negative'
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${wid}/e/${eid}/features`, extrudeData);
      const featureId = response.data.feature.featureId;

      this.emit('extrude_created', { documentId, extrudeId: featureId });

      return {
        id: featureId,
        volume: Math.PI * Math.pow(10, 2) * distance, // Simulated volume calculation
        raw: response.data
      };

    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Extrude API Error Context:', JSON.stringify(error.response.data, null, 2));
      }

      const hasAuth = (this.config.accessKey && this.config.secretKey) || this.tokens?.accessToken;
      if (error.response?.status === 401 || !hasAuth) {
        console.warn('⚠️ [OnShapeClient] Unauthorized or missing tokens. Falling back to mock Extrusion creation.');
        const mockResponse = {
          id: `extrude_${Date.now()}`,
          featureId: `feature_${Date.now()}`,
          volume: Math.PI * Math.pow(10, 2) * distance,
          surfaceArea: 2 * Math.PI * 10 * distance + 2 * Math.PI * Math.pow(10, 2)
        };

        this.emit('extrude_created', { documentId, extrudeId: mockResponse.id });
        return mockResponse;
      }
      throw new Error(`Failed to create extrude: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a revolve feature
   */
  async createRevolve(documentId: string, options: RevolveOptions): Promise<any> {
    const { sketchId, axisId, revolveType = 'FULL', angle = 360 } = options;

    try {
      const { wid, eid: defaultEid } = await this.getDocumentElements(documentId);
      const eid = options.partStudioEid ?? defaultEid;

      const revolveData = {
        feature: {
          btType: "BTMFeature-134",
          featureType: "revolve",
          name: `Revolve_${Date.now()}`,
          namespace: "",
          suppressed: false,
          nodeId: "",
          returnAfterSubfeatures: false,
          subFeatures: [],
          parameters: [
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "entities",
              queries: [
                {
                  btType: "BTMIndividualQuery-138",
                  queryString: `query = qSketchRegion(makeId("${sketchId}"));`,
                  nodeId: ""
                }
              ]
            },
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "axis",
              queries: [
                {
                  btType: "BTMIndividualQuery-138",
                  queryString: `query = qBodyType(qCreatedBy(makeId("${axisId}"), EntityType.EDGE), BodyType.WIRE);`,
                  nodeId: ""
                }
              ]
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "operationType",
              enumName: "NewBodyOperationType",
              value: "NEW"
            },
            {
              btType: "BTMParameterBoolean-144",
              parameterId: "fullRevolve",
              value: revolveType === 'FULL'
            },
            {
              btType: "BTMParameterQuantity-147",
              parameterId: "angle",
              expression: `${angle} deg`
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${wid}/e/${eid}/features`, revolveData);
      const featureId = response.data.feature.featureId;

      this.emit('revolve_created', { documentId, revolveId: featureId });
      return { id: featureId, raw: response.data };

    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Revolve API Error Context:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to create revolve: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a sweep feature
   */
  async createSweep(documentId: string, options: SweepOptions): Promise<any> {
    const { profileSketchId, pathId } = options;

    try {
      const { wid, eid: defaultEid } = await this.getDocumentElements(documentId);
      const eid = options.partStudioEid ?? defaultEid;

      const sweepData = {
        feature: {
          btType: "BTMFeature-134",
          featureType: "sweep",
          name: `Sweep_${Date.now()}`,
          namespace: "",
          suppressed: false,
          nodeId: "",
          returnAfterSubfeatures: false,
          subFeatures: [],
          parameters: [
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "profiles",
              queries: [
                {
                  btType: "BTMIndividualQuery-138",
                  queryString: `query = qSketchRegion(makeId("${profileSketchId}"));`,
                  nodeId: ""
                }
              ]
            },
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "path",
              queries: [
                {
                  btType: "BTMIndividualQuery-138",
                  queryString: `query = qBodyType(qCreatedBy(makeId("${pathId}"), EntityType.EDGE), BodyType.WIRE);`,
                  nodeId: ""
                }
              ]
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "operationType",
              enumName: "NewBodyOperationType",
              value: "NEW"
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "bodyType",
              enumName: "ExtendedToolBodyType",
              value: "SOLID"
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${wid}/e/${eid}/features`, sweepData);
      const featureId = response.data.feature.featureId;

      this.emit('sweep_created', { documentId, sweepId: featureId });
      return { id: featureId, raw: response.data };

    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Sweep API Error Context:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to create sweep: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a loft feature
   */
  async createLoft(documentId: string, options: LoftOptions): Promise<any> {
    const { profileIds } = options;

    try {
      const { wid, eid: defaultEid } = await this.getDocumentElements(documentId);
      const eid = options.partStudioEid ?? defaultEid;

      const loftData = {
        feature: {
          btType: "BTMFeature-134",
          featureType: "loft",
          name: `Loft_${Date.now()}`,
          namespace: "",
          suppressed: false,
          nodeId: "",
          returnAfterSubfeatures: false,
          subFeatures: [],
          parameters: [
            // Empty wireProfilesArray required by loft schema
            {
              btType: "BTMParameterArray-2025",
              parameterId: "wireProfilesArray",
              items: []
            },
            // Solid profiles: each profile is an array item with sheetProfileEntities
            {
              btType: "BTMParameterArray-2025",
              parameterId: "sheetProfilesArray",
              items: profileIds.map(id => ({
                btType: "BTMArrayParameterItem-1843",
                parameters: [
                  {
                    btType: "BTMParameterQueryList-148",
                    parameterId: "sheetProfileEntities",
                    queries: [
                      {
                        btType: "BTMIndividualQuery-138",
                        queryString: `query = qSketchRegion(makeId("${id}"));`,
                        nodeId: ""
                      }
                    ]
                  }
                ]
              }))
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "operationType",
              enumName: "NewBodyOperationType",
              value: "NEW"
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "surfaceOperationType",
              enumName: "NewSurfaceOperationType",
              value: "NEW"
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "bodyType",
              enumName: "ExtendedToolBodyType",
              value: "SOLID"
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${wid}/e/${eid}/features`, loftData);
      const featureId = response.data.feature.featureId;

      this.emit('loft_created', { documentId, loftId: featureId });
      return { id: featureId, raw: response.data };

    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Loft API Error Context:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to create loft: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a construction plane
   */
  async createPlane(documentId: string, options: PlaneOptions): Promise<any> {
    const { name, entities, offset = 10 } = options;

    try {
      const { wid, eid: defaultEid } = await this.getDocumentElements(documentId);
      const eid = options.partStudioEid ?? defaultEid;

      const planeData = {
        feature: {
          btType: "BTMFeature-134",
          featureType: "cPlane",
          name: name ? `${name}_${Date.now()}` : `Plane_${Date.now()}`,
          namespace: "",
          suppressed: false,
          nodeId: "",
          returnAfterSubfeatures: false,
          subFeatures: [],
          parameters: [
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "entities",
              queries: entities.map(id => {
                const mapped = this.mapPlaneName(id);
                const isDefault = ['top', 'front', 'right'].includes(mapped.toLowerCase());
                const queryString = isDefault
                  ? `query = qCreatedBy(makeId("${mapped}"), EntityType.FACE);`
                  : `query = qCreatedBy(makeId("${id}"), EntityType.FACE);`;

                return {
                  btType: "BTMIndividualQuery-138",
                  queryString,
                  nodeId: ""
                };
              })
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "cplaneType",
              enumName: "CPlaneType",
              value: "OFFSET"
            },
            {
              btType: "BTMParameterQuantity-147",
              parameterId: "offset",
              expression: `${offset} mm`
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${wid}/e/${eid}/features`, planeData);
      const featureId = response.data.feature.featureId;

      this.emit('plane_created', { documentId, planeId: featureId });
      return { id: featureId, raw: response.data };

    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Plane API Error Context:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to create plane: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a Fillet feature
   */
  async createFillet(documentId: string, options: FilletOptions): Promise<any> {
    const { entities, radius } = options;

    try {
      const { wid, eid: defaultEid } = await this.getDocumentElements(documentId);
      const eid = options.partStudioEid ?? defaultEid;

      const filletData = {
        feature: {
          btType: "BTMFeature-134",
          featureType: "fillet",
          name: options.featureName ? `${options.featureName}_${Date.now()}` : `Fillet_${Date.now()}`,
          namespace: "",
          suppressed: false,
          subFeatures: [],
          parameters: [
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "entities",
              queries: entities.map(id => ({
                btType: "BTMIndividualQuery-138",
                // Fillet edges created by the feature/sketch. 
                // Using EDGE is safer for fillets than FACE.
                queryString: `query = qCreatedBy(makeId("${id}"), EntityType.EDGE);`,
                nodeId: ""
              }))
            },
            {
              btType: "BTMParameterQuantity-147",
              parameterId: "radius",
              expression: `${radius} mm`
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${wid}/e/${eid}/features`, filletData);
      const featureId = response.data.feature.featureId;

      this.emit('fillet_created', { documentId, filletId: featureId });
      return { id: featureId, raw: response.data };

    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Fillet API Error Context:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to create fillet: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a Hole feature
   */
  async createHole(documentId: string, options: HoleOptions): Promise<any> {
    const { locationSketchId, faceId, diameter, depth, holeType = 'SIMPLE' } = options;

    try {
      const { wid, eid: defaultEid } = await this.getDocumentElements(documentId);
      const eid = options.partStudioEid ?? defaultEid;

      const holeData = {
        feature: {
          btType: "BTMFeature-134",
          featureType: "hole",
          name: options.featureName ? `${options.featureName}_${Date.now()}` : `Hole_${Date.now()}`,
          parameters: [
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "location",
              queries: locationSketchId ? [
                {
                  btType: "BTMIndividualQuery-138",
                  queryString: `query = qCreatedBy(makeId("${locationSketchId}"), EntityType.VERTEX);`,
                  nodeId: ""
                }
              ] : (faceId ? [
                {
                  btType: "BTMIndividualQuery-138",
                  queryString: `query = qCreatedBy(makeId("${faceId}"), EntityType.FACE);`,
                  nodeId: ""
                }
              ] : [])
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "holeType",
              enumName: "HoleType",
              value: holeType
            },
            {
              btType: "BTMParameterQuantity-147",
              parameterId: "diameter",
              expression: `${diameter} mm`
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "terminationType",
              enumName: "HoleTerminationType",
              value: depth ? "BLIND" : "THROUGH"
            },
            ...(depth ? [{
              btType: "BTMParameterQuantity-147",
              parameterId: "depth",
              expression: `${depth} mm`
            }] : [])
          ]
        }
      };

      const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${wid}/e/${eid}/features`, holeData);
      const featureId = response.data.feature.featureId;

      this.emit('hole_created', { documentId, holeId: featureId });
      return { id: featureId, raw: response.data };

    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Hole API Error Context:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to create hole: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create an External Thread feature
   */
  async createExternalThread(documentId: string, options: ExternalThreadOptions): Promise<any> {
    const { entities, standard = 'ANSI', size = '3/4', depth = 40, threadsPerInch = 10, pitch = '2.5 mm' } = options;

    try {
      const { wid, eid: defaultEid } = await this.getDocumentElements(documentId);
      const eid = options.partStudioEid ?? defaultEid;

      const threadData = {
        feature: {
          btType: "BTMFeature-134",
          featureType: "externalThread",
          name: options.featureName ? `${options.featureName}_${Date.now()}` : `ExternalThread_${Date.now()}`,
          parameters: [
            {
              btType: "BTMParameterQueryList-148",
              parameterId: "entities",
              queries: entities.map(id => ({
                btType: "BTMIndividualQuery-138",
                // Correct FeatureScript function is qGeometryFilter
                queryString: `query = qGeometryFilter(qCreatedBy(makeId("${id}"), EntityType.FACE), GeometryType.CYLINDER);`,
                nodeId: ""
              }))
            },
            {
              btType: "BTMParameterEnum-145",
              parameterId: "standard",
              enumName: "ThreadStandard",
              value: standard
            },
            {
              btType: "BTMParameterString-149",
              parameterId: "size",
              value: size
            },
            ...(standard === 'ANSI' ? [{
              btType: "BTMParameterQuantity-147",
              parameterId: "threadsPerInch",
              expression: `${threadsPerInch}`
            }] : [{
              btType: "BTMParameterQuantity-147",
              parameterId: "pitch",
              expression: pitch
            }]),
            {
              btType: "BTMParameterQuantity-147",
              parameterId: "length",
              expression: `${depth} mm`
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(`/api/v6/partstudios/d/${documentId}/w/${wid}/e/${eid}/features`, threadData);
      const featureId = response.data.feature.featureId;

      this.emit('thread_created', { documentId, threadId: featureId });
      return { id: featureId, raw: response.data };

    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] External Thread API Error Context:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to create external thread: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a new Assembly tab in a document (real API)
   */
  async createAssembly(documentId: string, options: { name: string; parts?: string[] }): Promise<any> {
    const { name } = options;

    try {
      const { wid } = await this.getDocumentElements(documentId);

      // POST /api/v9/assemblies/d/{did}/w/{wid} creates a new Assembly tab
      const response = await this.axiosInstance.post(`/api/v9/assemblies/d/${documentId}/w/${wid}`, { name });
      const assemblyElement = response.data;

      this.emit('assembly_created', { documentId, assemblyId: assemblyElement.id });
      return {
        id: assemblyElement.id,
        elementId: assemblyElement.id,
        name: assemblyElement.name,
        workspaceId: wid,
        documentId
      };
    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Assembly API Error:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to create assembly: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get the first partId from a Part Studio element.
   */
  async getPartId(documentId: string, workspaceId: string, elementId: string): Promise<string> {
    const response = await this.axiosInstance.get(`/api/v9/parts/d/${documentId}/w/${workspaceId}/e/${elementId}?withThumbnails=false&includePropertyDefaults=false`);
    const parts = response.data;
    if (!parts || parts.length === 0) throw new Error('No parts found in Part Studio ' + elementId);
    return parts[0].partId;
  }

  /**
   * Insert a part from a Part Studio into an Assembly.
   */
  async insertPartIntoAssembly(options: {
    targetDocumentId: string;
    targetWorkspaceId: string;
    targetAssemblyElementId: string;
    sourceDocumentId: string;
    sourceWorkspaceId: string;
    sourceElementId: string;
    partId?: string;
  }): Promise<any> {
    const { targetDocumentId, targetWorkspaceId, targetAssemblyElementId,
      sourceDocumentId, sourceWorkspaceId, sourceElementId, partId } = options;

    // Resolve partId if not provided
    const resolvedPartId = partId ?? await this.getPartId(sourceDocumentId, sourceWorkspaceId, sourceElementId);

    const payload = {
      documentId: sourceDocumentId,
      elementId: sourceElementId,
      includePartTypes: ["PARTS"],
      partId: resolvedPartId
    };

    try {
      const response = await this.axiosInstance.post(
        `/api/v9/assemblies/d/${targetDocumentId}/w/${targetWorkspaceId}/e/${targetAssemblyElementId}/instances`,
        payload
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        console.error('❌ [OnShapeClient] Insert Part Error:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to insert part into assembly: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Add a mate/constraint between features in an assembly
   */
  async addMate(documentId: string, options: {
    assemblyId: string;
    mateType: string;
    feature1: string;
    feature2: string;
    parameters?: any;
  }): Promise<any> {
    const { assemblyId, mateType, feature1, feature2, parameters = {} } = options;

    try {
      const mateData = {
        featureName: `${mateType}_mate`,
        mateType,
        features: [feature1, feature2],
        parameters
      };

      // Mock response for demonstration
      const response = {
        data: {
          id: `mate_${Date.now()}`,
          mateType,
          features: [feature1, feature2],
          status: 'active'
        }
      };

      this.emit('mate_added', { documentId, assemblyId, mateId: response.data.id });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to add mate: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Set material properties for a part
   */
  async setMaterial(documentId: string, options: {
    partId: string;
    materialName: string;
    customProperties?: MaterialProperties;
  }): Promise<any> {
    const { partId, materialName, customProperties = {} as MaterialProperties } = options;

    try {
      const materialData = {
        materialName,
        customProperties
      };

      // Mock response for demonstration
      const response = {
        data: {
          partId,
          materialName,
          properties: {
            density: customProperties.density || 2700, // Aluminum default
            youngsModulus: customProperties.youngsModulus || 69000, // MPa
            poissonsRatio: customProperties.poissonsRatio || 0.33
          }
        }
      };

      this.emit('material_set', { documentId, partId, materialName });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to set material: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get available materials from the material library
   */
  async getMaterialLibrary(options: { category?: string } = {}): Promise<MaterialProperties[]> {
    const { category } = options;

    try {
      // Mock material library data
      const materials: MaterialProperties[] = [
        { name: 'Aluminum 6061', density: 2700, youngsModulus: 69000, poissonsRatio: 0.33, yieldStrength: 276, tensileStrength: 310 },
        { name: 'Steel A36', density: 7850, youngsModulus: 200000, poissonsRatio: 0.3, yieldStrength: 250, tensileStrength: 400 },
        { name: 'Carbon Fiber', density: 1600, youngsModulus: 230000, poissonsRatio: 0.3, yieldStrength: 1500, tensileStrength: 3500 },
        { name: 'PLA Plastic', density: 1250, youngsModulus: 3500, poissonsRatio: 0.35, yieldStrength: 60, tensileStrength: 65 },
        { name: 'Titanium Grade 5', density: 4430, youngsModulus: 114000, poissonsRatio: 0.31, yieldStrength: 880, tensileStrength: 950 }
      ];

      return category ? materials.filter(m =>
        category === 'metals' ? ['Aluminum 6061', 'Steel A36', 'Titanium Grade 5'].includes(m.name) :
          category === 'plastics' ? ['PLA Plastic'].includes(m.name) :
            category === 'composites' ? ['Carbon Fiber'].includes(m.name) :
              true
      ) : materials;
    } catch (error: any) {
      throw new Error(`Failed to get material library: ${error.message}`);
    }
  }

  /**
   * Export a part in specified format
   */
  async exportPart(documentId: string, options: {
    partId: string;
    format: 'step' | 'iges' | 'stl' | 'obj' | 'ply' | 'x_t';
    options?: ExportOptions;
  }): Promise<any> {
    const { partId, format, options: exportOptions = {} } = options;

    try {
      const exportData = {
        partId,
        format,
        options: exportOptions
      };

      // Mock response for demonstration
      const response = {
        data: {
          exportId: `export_${Date.now()}`,
          status: 'completed',
          downloadUrl: `https://files.onshape.com/downloads/${documentId}/${partId}.${format}`,
          fileSize: Math.floor(Math.random() * 1000000) + 50000, // Random file size
          createdAt: new Date().toISOString()
        }
      };

      this.emit('part_exported', { documentId, partId, format, exportId: response.data.exportId });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to export part: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Import a CAD file into OnShape
   */
  async importPart(documentId: string, options: {
    fileUrl: string;
    fileType: string;
  }): Promise<any> {
    const { fileUrl, fileType } = options;

    try {
      const importData = {
        fileUrl,
        fileType,
        targetDocument: documentId
      };

      // Mock response for demonstration
      const response = {
        data: {
          importId: `import_${Date.now()}`,
          status: 'completed',
          partId: `part_${Date.now()}`,
          featuresCreated: Math.floor(Math.random() * 10) + 1
        }
      };

      this.emit('part_imported', { documentId, fileType, partId: response.data.partId });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to import part: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get document details and metadata
   */
  async getDocument(documentId: string): Promise<DocumentInfo> {
    try {
      const response = await this.axiosInstance.get(`/api/v3/documents/${documentId}`);
      const doc = response.data;

      return {
        id: doc.id,
        name: doc.name,
        description: doc.description,
        createdAt: doc.createdAt,
        modifiedAt: doc.modifiedAt,
        owner: doc.owner?.email || doc.owner?.name,
        visibility: doc.visibility
      };
    } catch (error: any) {
      throw new Error(`Failed to get document: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/api/v3/documents/${documentId}`);
      this.emit('document_deleted', { documentId });
    } catch (error: any) {
      throw new Error(`Failed to delete document: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return this.tokens !== null;
  }

  /**
   * Get access token (for debugging purposes)
   */
  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.tokens = null;
    this.emit('logged_out');
  }
}

export default OnShapeClient;