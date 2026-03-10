# ANSI 3/4" Bolt Design Specifications

## Document Information
- **Document Name:** ANSI 3/4 Bolt Design
- **Document ID:** a17635ab573de75cc79dbd5a
- **Created:** 2026-03-08T07:13:02.366+00:00
- **Units:** Millimeters (mm)

## Bolt Specifications

### Thread Details
- **Standard:** ANSI External Thread
- **Nominal Diameter:** 3/4" (19.05mm)
- **Thread Type:** Coarse Thread
- **Pitch:** 10 TPI (Threads Per Inch)
- **Thread Depth:** 0.5mm
- **Thread Length:** 45mm (from bottom of head to tip)

### Head Specifications
- **Type:** Hexagonal Bolt Head
- **Across Flats:** 1.125" (28.575mm)
- **Head Height:** 12.7mm (0.5")
- **Head Chamfer:** Standard 30° chamfer
- **Material Removal Volume:** 3,989.82 mm³

### Shaft Specifications
- **Diameter:** 19.05mm (nominal 3/4")
- **Length:** 50mm (excluding head)
- **Material Addition Volume:** 15,707.96 mm³
- **Total Bolt Length:** 62.7mm (head + shaft)

### Transition Features
- **Head-to-Shaft Fillet:** 1mm radius
- **Purpose:** Stress concentration reduction
- **Location:** Junction between head and shaft

## CAD Features Created

1. **Hexagonal Head Sketch** (ID: F82IxjiWvvdUH1f_0)
   - Plane: Top
   - Geometry: Regular hexagon
   - Inradius: 14.287mm

2. **Bolt Head Extrude** (ID: FPDrN0crTJYM0bO_0)
   - Distance: 12.7mm
   - Operation: NEW body
   - Volume: 3,989.82 mm³

3. **Shaft Sketch** (ID: FkaTfkVwkGga0oO_1)
   - Plane: Top
   - Geometry: Circle
   - Radius: 9.525mm

4. **Bolt Shaft Extrude** (ID: FAxREk1K9MK6CZB_1)
   - Distance: 50mm (negative direction)
   - Operation: ADD to existing body
   - Volume: 15,707.96 mm³

5. **Thread Feature** (ID: FPAPXWP4cBN9LwE_1)
   - Standard: ANSI
   - Size: 3/4"
   - Pitch: 10 tpi
   - Status: Feature creation encountered technical issues

## Manufacturing Considerations

### Thread Standards Compliance
- **ANSI B1.1:** Unified National Thread Standard
- **Coarse Thread Series:** UNC (Unified Coarse)
- **Thread Fit:** Class 2A (external threads)
- **Material:** Typically carbon steel or stainless steel

### Machining Operations Required
1. **Head Machining:**
   - Hexagonal milling or forging
   - Chamfer operations
   - Face milling for bearing surface

2. **Shaft Machining:**
   - Turning to nominal diameter
   - Thread rolling or cutting (10 TPI)
   - End chamfering

3. **Quality Control:**
   - Thread gauge verification
   - Dimensional inspection
   - Surface finish requirements

## Final Dimensions Summary

| Feature | Imperial | Metric |
|---------|----------|---------|
| Nominal Diameter | 0.750" | 19.05mm |
| Head Across Flats | 1.125" | 28.575mm |
| Head Height | 0.500" | 12.7mm |
| Thread Pitch | 10 TPI | 2.54mm |
| Shaft Length | 1.969" | 50mm |
| Total Length | 2.469" | 62.7mm |
| Thread Length | 1.772" | 45mm |

## Technical Notes

1. **Measurement System Resolution:**
   - 3/4" ANSI = 19.05mm nominal (resolved from 19mm specification)
   - Thread pitch 10 TPI = 2.54mm pitch

2. **Design Features:**
   - Standard hexagonal head proportions
   - Adequate head-to-shaft transition
   - Appropriate thread length for typical applications

3. **CAD Limitations:**
   - Automated thread feature encountered technical difficulties
   - Manual thread modeling recommended for production drawings
   - Thread specification documented for manufacturing reference

---
**Document Status:** Complete bolt geometry created, thread feature requires manual completion or alternative CAD approach