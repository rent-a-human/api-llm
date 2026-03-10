# Onshape API Modeling Learnings

This document synthesizes technical discoveries made during the integration of the Onshape REST API for MCP CAD tools.

## Authentication
- **Method**: Basic Authentication.
- **Header**: `Authorization: Basic <base64(accessKey:secretKey)>`.
- **Base URL**: `https://cad.onshape.com/api`.

## Document Structure
- **Path Template**: `/api/v6/partstudios/d/{did}/w/{wid}/e/{eid}/features`
- **Workspace (w)**: Mandatory for `POST` requests (write operations).
- **Element (e)**: Refers to a specific tab (Part Studio or Assembly).

## BTM (Better Transition Model) Schema
Onshape uses BTM for feature creation. Every parameter needs a specific `btType` suffix (e.g., `-148`, `-138`).

### 1. Sketch Geometry — CRITICAL
A sketch (`BTMSketch-151`) requires an `entities` array. Without proper parameters, sketches appear empty.
- **Lines**: Must include `startParam: 0`, `endParam: length`, and **normalized direction vectors** (`dirX`, `dirY`).
- **Circles**: `BTCurveGeometryCircle-115` requires `xDir: 1, yDir: 0` for its coordinate frame.
- **Hexagons**: Built from 6 line segments using `BTMIndividualQuery-138` with vertex coordinates at 60° intervals.

### 2. Feature Queries & Reference Mapping
**DO NOT use `BTMIndividualCreatedByQuery-137` simple mode.** It defaults to `BodyType.SOLID` and fails to resolve sketch wire edges.
- **Correct approach**: Use `BTMIndividualQuery-138` with `queryString`.
- **Sketch Region (Profiles)**: `query = qSketchRegion(makeId("SKETCH_ID"));`
- **Sketch Edges (Axis/Path)**: `query = qBodyType(qCreatedBy(makeId("SKETCH_ID"), EntityType.EDGE), BodyType.WIRE);`
- **Feature Faces (Fillet/Hole)**: `query = qCreatedBy(makeId("EXTRUDE_ID"), EntityType.FACE);`

### 3. Operation Types (Extrude)
All operations use the SAME `operationType` parameterId with the `NewBodyOperationType` enum:
- `NEW`: Create new parts.
- `ADD`: Merge with existing parts (use this for unified bolt head + shaft).
- `REMOVE`: Boolean subtract (e.g., for nut holes).
- `INTERSECT`: Boolean intersect.

### 4. Revolve & Sweep Parameter IDs
The parameter IDs are picky and differ from some docs:
- **Revolve**: `entities` (profiles), `axis` (revolveAxis).
- **Sweep**: `profiles` (profile entities), `path` (sweepPath).

### 5. Loft — Complex Structure
Loft does NOT use a flat profile list. It uses:
- `sheetProfilesArray`: `BTMParameterArray-2025`
- Items: `BTMArrayParameterItem-1843`
- Inside item: `sheetProfileEntities` (QueryList).

### 6. Assembly Implementation
1. **Create Tab**: `POST /api/v9/assemblies/d/{did}/w/{wid}/e/{eid}` with `{ "name": "..." }`.
2. **Resolve Part IDs**: `GET /api/v9/parts/d/{did}/w/{wid}/e/{eid}` to find the `partId` of solids.
3. **Insert Instance**: `POST /api/v9/assemblies/d/{did}/w/{wid}/e/{eid}/instances`.
   - **Crucial**: Cross-document insertion requires a versionId. Same-document insertion (source and target are in the same DID) does not require a version and is preferred for rapid prototyping.

### 7. Spatial Alignment & Orientation
A common pitfall is using multiple different reference planes for related features.
- **Problem**: Creating a Bolt Head on the `Top` plane and a Bolt Shaft on the `Front` plane causes the shaft to extrude at 90 degrees relative to the head ("horizontal" bolt).
- **Solution**: Always build related features on **the same coordinate system**. 
- **Rule of Thumb**: Use `Top` for both the head and the shaft profile.

### 8. Hardware Recipe (19mm Bolt)
To ensure correct orientation and feature regeneration, follow this sequence:
1. **Head Sketch**: Plane: `Top`, Geometry: `hexagon` ([0,0,9.5]).
2. **Head Extrude**: Distance: 10mm, Operation: `NEW`.
3. **Shaft Sketch**: Plane: `Top` (the same as head!), Geometry: `circle` ([0,0,6]).
4. **Shaft Extrude**: Distance: 50mm, Operation: `ADD`. This merges the shaft into the head.
5. **Fillets**: Target the `extrude` feature IDs. Use `featureName` for organization.
6. **Threads (Hole)**: Target a point in the `Shaft Sketch`.

## Common Pitfalls (The "Why it Failed" Checklist)
1. **Empty Sketch**: Missing `startParam`/`endParam` on lines or `xDir/yDir` on circles.
2. **Missing Edge error**: `BTMIndividualCreatedByQuery` defaulted to SOLID on a WIRE edge (Axis selection).
3. **90-Degree Tilt**: Mixing reference planes (e.g. `Top` for head, `Front` for shaft).
4. **Broken Fillets**: Using `EntityType.FACE` when selecting complex features. Use `featureName` and target the specific modeling tool output.
5. **Empty Hole Location**: Forgetting to provide a `locationSketchId` or selecting a face without a specific point query.
6. **500 Error**: Incorrect `btType` suffix (e.g., using `-134` for a sketch instead of `-151`).
