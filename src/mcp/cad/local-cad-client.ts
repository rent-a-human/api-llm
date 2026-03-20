import { primitives, booleans, transforms, extrusions, geometries, maths, measurements } from '@jscad/modeling';
// @ts-ignore
import { serialize } from '@jscad/stl-serializer';
import fs from 'fs';
import path from 'path';

export interface BoltOptions {
    headWidth: number; // across flats
    headHeight: number;
    shaftDiameter: number;
    shaftLength: number;
    threadPitch?: number;
    threadLength?: number;
    headFillet?: number;
    tipChamfer?: number;
    tipDiameter?: number;
    resolution?: number;
}

export interface NutOptions {
    width: number; // across flats
    height: number;
    holeDiameter: number;
    threadPitch?: number;
    counterSink?: number;
    resolution?: number;
}

export interface GearOptions {
    teeth: number;
    module: number;
    thickness: number;
    holeDiameter: number;
    helixAngle?: number;
    pressureAngle?: number;
    resolution?: number;
}

export interface TubeOptions {
    innerDiameter: number;
    outerDiameter: number;
    length: number;
    resolution?: number;
}

export interface Tube2DOptions {
    profile: [number, number][];
    path: [number, number, number][];
}

export interface ShoppingCartOptions {
    basketLength: number;
    basketWidth: number;
    basketHeight: number;
    wheelDiameter: number;
    resolution?: number;
    hasScooter?: boolean;
    hasArms?: boolean;
    scooterLength?: number;
    armReach?: number;
    handlebarWidth?: number;
    basketDensity?: number;
    scooterWidth?: number;
    wheelArmReach?: number;
    suspensionHeight?: number;
    suspensionOffset?: number;
    basketFloorHeight?: number;
}

export interface GoCartOptions {
    chassisLength: number;
    chassisWidth: number;
    wheelDiameter: number;
    seatHeight: number;
    resolution?: number;
}

export interface BottleOptions {
    bottomRadius: number;
    bodyHeight: number;
    shoulderHeight: number;
    neckRadius: number;
    neckHeight: number;
    wallThickness: number;
    resolution?: number;
}

export interface ScooterOptions {
    scooterLength: number;
    handlebarWidth: number;
    resolution?: number;
}

export class LocalCADClient {
    private modelsDir: string;

    constructor() {
        this.modelsDir = path.join(process.cwd(), 'public', 'models');
        if (!fs.existsSync(this.modelsDir)) {
            fs.mkdirSync(this.modelsDir, { recursive: true });
        }
    }

    /**
     * Generates a high-fidelity parametric bolt.
     */
    async createBolt(options: BoltOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        console.log('[LocalCAD] Creating Bolt with options:', options);
        const {
            headWidth,
            headHeight,
            shaftDiameter,
            shaftLength,
            threadPitch = 1.75,
            threadLength = 35,
            headFillet = 1.2,
            tipChamfer = 1.5,
            tipDiameter,
            resolution = 32
        } = options;
        const segments = resolution;
        const pitch = threadPitch;
        const majorRadius = shaftDiameter / 2;
        const threadHeight = 0.866 * pitch;
        const threadTruncation = 0.15;
        const rootRadius = majorRadius - threadHeight * (1 - threadTruncation * 2);
        const actualThreadLength = Math.min(threadLength, shaftLength);
        const neckLength = shaftLength - actualThreadLength;
        const tipLength = Math.max(0, tipChamfer);

        // Use provided tipDiameter or default to a reasonable fraction of rootRadius
        const finalTipDiameter = tipDiameter !== undefined ? tipDiameter : rootRadius * 0.8;
        const tipRadius = finalTipDiameter / 2;

        // 1. HEAD
        const circumradius = headWidth / Math.sqrt(3);
        let head = primitives.cylinder({ radius: circumradius, height: headHeight, segments: 6 });
        head = transforms.translate([0, 0, headHeight / 2], head);
        const roundingRadius = headWidth * 1.25;
        const borderSphere = primitives.sphere({ radius: roundingRadius, segments: segments });
        const movedTopSphere = transforms.translate([0, 0, headHeight - roundingRadius + 0.3], borderSphere);
        head = booleans.intersect(head, movedTopSphere);

        // 2. SHAFT CORE
        let combinedShaft;
        // The core is a cylinder of rootRadius
        combinedShaft = transforms.translate([0, 0, -shaftLength / 2],
            primitives.cylinder({ radius: rootRadius, height: shaftLength, segments: segments }));

        if (neckLength > 0) {
            // Make neck slightly wider than majorRadius to ensure it hides threads perfectly
            const neck = primitives.cylinder({ radius: majorRadius + 0.01, height: neckLength, segments: segments });
            combinedShaft = booleans.union(combinedShaft, transforms.translate([0, 0, -neckLength / 2], neck));
        }

        if (headFillet > 0) {
            const currentRadius = neckLength > 0 ? majorRadius + 0.01 : rootRadius;
            const shoulder = primitives.cylinderElliptic({ startRadius: [currentRadius, currentRadius], endRadius: [currentRadius + headFillet, currentRadius + headFillet], height: headFillet, segments: segments });
            combinedShaft = booleans.union(combinedShaft, transforms.translate([0, 0, -headFillet / 2], shoulder));
        }

        // 3. THREADS
        if (actualThreadLength > 0) {
            const threadProfile = primitives.polygon({ points: [[rootRadius - 0.2, -pitch * 0.45], [majorRadius + 0.1, -pitch * threadTruncation], [majorRadius + 0.1, pitch * threadTruncation], [rootRadius - 0.2, pitch * 0.45]] });
            const helix = extrusions.extrudeHelical({ pitch: pitch, angle: Math.PI * 2 * (actualThreadLength / pitch), segmentsPerRotation: segments }, threadProfile);

            // Align helix bottom with absolute tip
            const helixBottomOffset = pitch * 0.45;
            let movedHelix = transforms.translate([0, 0, -shaftLength + helixBottomOffset], helix);

            // Clip threads to the shaft bounds (avoid neck climbing)
            const threadClipHeight = actualThreadLength;
            const threadClip = transforms.translate([0, 0, -neckLength - threadClipHeight / 2],
                primitives.cylinder({ radius: majorRadius + 2, height: threadClipHeight, segments: segments }));

            const clippedThreads = booleans.intersect(movedHelix, threadClip);
            combinedShaft = booleans.union(combinedShaft, clippedThreads);
        }

        // 4. UNIFIED CHAMFER (Subtractive)
        if (tipLength > 0.01) {
            const cutterHeight = tipLength;
            const cutterOuterRadius = majorRadius + 5;

            // The "Preservation Hole" narrows towards the face using tipRadius
            const hole = primitives.cylinderElliptic({
                startRadius: [tipRadius, tipRadius],
                endRadius: [majorRadius, majorRadius],
                height: cutterHeight,
                segments: segments
            });

            const cornerCutter = booleans.subtract(
                primitives.cylinder({ radius: cutterOuterRadius, height: cutterHeight, segments: segments }),
                hole
            );

            const cutterZ = -shaftLength + cutterHeight / 2;
            combinedShaft = booleans.subtract(combinedShaft, transforms.translate([0, 0, cutterZ], cornerCutter));

            // Cleanup: ensure no thread peak survives outside majorRadius beyond junction
            const cleanupHeight = 5;
            const cleanupCutter = booleans.subtract(
                primitives.cylinder({ radius: cutterOuterRadius, height: cleanupHeight, segments: segments }),
                primitives.cylinder({ radius: majorRadius + 0.01, height: cleanupHeight, segments: segments })
            );
            combinedShaft = booleans.subtract(combinedShaft, transforms.translate([0, 0, -shaftLength + tipLength + cleanupHeight / 2], cleanupCutter));
        }

        return this.saveModel(`bolt-threaded-${Date.now()}`, booleans.union(head, combinedShaft), { type: 'bolt', parameters: options });
    }

    /**
     * Generates a high-fidelity parametric Nut.
     */
    async createNut(options: NutOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        const { width, height, holeDiameter, threadPitch = 1.75, counterSink = 1.0, resolution = 32 } = options;
        const segments = resolution;
        const circumradius = width / Math.sqrt(3);
        const internalRadius = holeDiameter / 2;
        const pitch = threadPitch;

        // 1. Outer Hex Body
        let body = primitives.cylinder({ radius: circumradius, height: height, segments: 6 });

        // 2. Dual Arched Borders (Machine Look)
        const roundingRadius = width * 1.25;
        const borderSphere = primitives.sphere({ radius: roundingRadius, segments: segments });
        const topSphere = transforms.translate([0, 0, height / 2 - roundingRadius + 0.3], borderSphere);
        const bottomSphere = transforms.translate([0, 0, -height / 2 + roundingRadius - 0.3], borderSphere);
        body = booleans.intersect(body, topSphere, bottomSphere);

        // 3. Thread Helix
        const threadHeight = 0.866 * pitch;
        const threadTruncation = 0.1;
        const threadRoot = internalRadius + threadHeight * (1 - threadTruncation * 2);

        const threadProfile = primitives.polygon({
            points: [
                [internalRadius - 0.2, -pitch * 0.45],
                [threadRoot + 0.2, -pitch * threadTruncation],
                [threadRoot + 0.2, pitch * threadTruncation],
                [internalRadius - 0.2, pitch * 0.45]
            ]
        });

        const helix = extrusions.extrudeHelical({
            pitch: pitch,
            angle: Math.PI * 2 * (height / pitch + 2),
            segmentsPerRotation: segments
        }, threadProfile);

        const movedHelix = transforms.translate([0, 0, -height / 2 - pitch], helix);
        // CLIP threads precisely to height
        const internalThreads = booleans.intersect(movedHelix, primitives.cylinder({ radius: threadRoot + 0.5, height: height, segments: segments }));

        // 4. Final Subtractive Pass (The Key to Cleanliness)
        // We union everything then subtract the hole and countersinks to guarantee no leftovers
        let finalNut = booleans.union(body, internalThreads);

        // Subtract the main hole AFTER unioning threads to remove helical bases
        const finalHole = primitives.cylinder({ radius: internalRadius, height: height + 0.2, segments: segments });
        finalNut = booleans.subtract(finalNut, finalHole);

        if (counterSink > 0) {
            const csOuterRadius = circumradius + 1;
            const csHeight = counterSink;

            const topCS = primitives.cylinderElliptic({
                startRadius: [internalRadius, internalRadius], // Start exactly at hole edge
                endRadius: [csOuterRadius, csOuterRadius],
                height: csHeight,
                segments: segments
            });
            finalNut = booleans.subtract(finalNut, transforms.translate([0, 0, height / 2 - csHeight / 2], topCS));

            const bottomCS = primitives.cylinderElliptic({
                startRadius: [csOuterRadius, csOuterRadius],
                endRadius: [internalRadius, internalRadius],
                height: csHeight,
                segments: segments
            });
            finalNut = booleans.subtract(finalNut, transforms.translate([0, 0, -height / 2 + csHeight / 2], bottomCS));
        }

        return this.saveModel(`nut-${Date.now()}`, finalNut, { type: 'nut', parameters: options });
    }

    // Generates a parametric Mathematically Correct Involute Gear.
    async createGear(options: GearOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        try {
            const { teeth, module, thickness, holeDiameter, helixAngle = 0, pressureAngle = 20, resolution = 64 } = options;

            // Parameter verification
            if (pressureAngle > 35 && helixAngle === 0) {
                throw new Error("Pressure angle above 35° with zero helix angle results in invalid, self-intersecting tooth roots.");
            }

            const alpha = (pressureAngle * Math.PI) / 180;
            const pr = (teeth * module) / 2;         // Pitch radius
            const br = Math.max(0.1, pr * Math.cos(alpha));         // Base radius
            const ar = pr + module;                  // Addendum radius
            const dr = Math.max(0.1, pr - 1.25 * module);           // Dedendum radius

            const invAlpha = Math.tan(alpha) - alpha;
            const halfPitchAngle = (Math.PI / 2) / teeth;
            const halfToothBaseAngle = halfPitchAngle + invAlpha;

            const points: [number, number][] = [];
            const toothAngleStep = (Math.PI * 2) / teeth;

            // Pre-calculate theta at dedendum radius to define the gap edges
            const alpha_dr = Math.acos(Math.min(1, br / dr));
            const inv_dr = Math.tan(alpha_dr) - alpha_dr;
            const theta_dr = dr < br ? halfToothBaseAngle : halfToothBaseAngle - inv_dr;

            for (let i = 0; i < teeth; i++) {
                const centerAngle = i * toothAngleStep;

                // 1. Side 1: involute from base/dedendum to addendum
                const sideSteps = 15;
                if (dr < br) {
                    points.push([dr * Math.cos(centerAngle - halfToothBaseAngle), dr * Math.sin(centerAngle - halfToothBaseAngle)]);
                }
                for (let s = 0; s <= sideSteps; s++) {
                    const r = Math.max(br, dr) + (ar - Math.max(br, dr)) * (s / sideSteps);
                    const alpha_r = Math.acos(Math.min(1, br / r));
                    const inv_r = Math.tan(alpha_r) - alpha_r;
                    const theta = halfToothBaseAngle - inv_r;
                    points.push([r * Math.cos(centerAngle - theta), r * Math.sin(centerAngle - theta)]);
                }

                // 2. Side 2: involute from addendum back to base/dedendum
                for (let s = sideSteps; s >= 0; s--) {
                    const r = Math.max(br, dr) + (ar - Math.max(br, dr)) * (s / sideSteps);
                    const alpha_r = Math.acos(Math.min(1, br / r));
                    const inv_r = Math.tan(alpha_r) - alpha_r;
                    const theta = halfToothBaseAngle - inv_r;
                    points.push([r * Math.cos(centerAngle + theta), r * Math.sin(centerAngle + theta)]);
                }
                if (dr < br) {
                    points.push([dr * Math.cos(centerAngle + halfToothBaseAngle), dr * Math.sin(centerAngle + halfToothBaseAngle)]);
                }

                // 3. ULTRA RESOLUTION DEDENDUM ARC
                const gapStartAngle = centerAngle + theta_dr;
                const nextCenterAngle = (i + 1) * toothAngleStep;
                const gapEndAngle = nextCenterAngle - theta_dr;

                const gapSteps = 150; // Massively increased resolution
                for (let g = 0; g <= gapSteps; g++) {
                    const angle = gapStartAngle + (gapEndAngle - gapStartAngle) * (g / gapSteps);
                    points.push([
                        dr * Math.cos(angle),
                        dr * Math.sin(angle)
                    ]);
                }
            }

            // FILTER: Remove duplicates and very close points
            const filteredPoints: [number, number][] = [];
            for (let i = 0; i < points.length; i++) {
                const curr = points[i];
                const prev = filteredPoints[filteredPoints.length - 1];
                if (!prev || Math.hypot(curr[0] - prev[0], curr[1] - prev[1]) > 0.00001) {
                    filteredPoints.push(curr);
                }
            }

            const gear2d = primitives.polygon({ points: filteredPoints });
            const twistAngleRad = helixAngle !== 0 ? (thickness * Math.tan(helixAngle * Math.PI / 180)) / pr : 0;

            let gear = extrusions.extrudeLinear({
                height: thickness,
                twistAngle: twistAngleRad,
                twistSteps: Math.max(1, Math.floor(Math.abs(helixAngle) / 2))
            }, gear2d);

            gear = transforms.translate([0, 0, -thickness / 2], gear);

            if (holeDiameter > 0) {
                const hole = primitives.cylinder({ radius: holeDiameter / 2, height: thickness + 5, segments: resolution });
                gear = booleans.subtract(gear, hole);
            }

            return this.saveModel(`gear-${Date.now()}`, gear, { type: 'gear', parameters: options });
        } catch (error: any) {
            console.error('[LocalCAD] Error creating Gear:', error);
            throw error;
        }
    }

    /**
     * Generates a parametric tube (cylindrical shell).
     */
    async createTube(options: TubeOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        console.log('[LocalCAD] Creating Tube with options:', options);
        const { innerDiameter, outerDiameter, length, resolution = 64 } = options;
        const segments = resolution;

        if (innerDiameter >= outerDiameter) {
            throw new Error("Inner diameter must be less than outer diameter.");
        }

        const outer = primitives.cylinder({ radius: outerDiameter / 2, height: length, segments });
        if (innerDiameter > 0) {
            const inner = primitives.cylinder({ radius: innerDiameter / 2, height: length + 2, segments });
            const tube = booleans.subtract(outer, inner);
            return this.saveModel(`tube-${Date.now()}`, tube, { type: 'tube', parameters: options });
        }

        return this.saveModel(`tube-${Date.now()}`, outer, { type: 'tube', parameters: options });
    }

    /**
     * Generates a parametric tube based on a 2D profile extruded along a 3D path.
     */
    async createTube2D(options: Tube2DOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        console.log('[LocalCAD] Creating Tube2D with options:', options);
        const { profile, path: pathPoints } = options;
        const { mat4, vec3 } = maths;

        if (profile.length < 3) throw new Error("Profile must have at least 3 points.");
        if (pathPoints.length < 2) throw new Error("Path must have at least 2 points.");

        const profileShape = primitives.polygon({ points: profile });
        const baseSlice = extrusions.slice.fromSides(geometries.geom2.toSides(profileShape));

        const callback = (progress: number, index: number, base: any) => {
            const point = pathPoints[index];
            let nextPoint = pathPoints[index + 1];
            let prevPoint = pathPoints[index - 1];

            let tangent;
            if (nextPoint) {
                tangent = vec3.subtract(vec3.create(), nextPoint, point);
            } else if (prevPoint) {
                tangent = vec3.subtract(vec3.create(), point, prevPoint);
            } else {
                tangent = vec3.fromValues(0, 0, 1);
            }
            vec3.normalize(tangent, tangent);

            const translation = mat4.fromTranslation(mat4.create(), point);
            const rotation = (mat4 as any).fromVectorRotation(mat4.create(), [0, 0, 1], tangent);
            const combined = mat4.multiply(mat4.create(), translation, rotation);

            return extrusions.slice.transform(combined, base);
        };

        try {
            const tube = extrusions.extrudeFromSlices({
                numberOfSlices: pathPoints.length,
                callback: callback,
                capStart: true,
                capEnd: true
            }, baseSlice);

            return this.saveModel(`tube2d-${Date.now()}`, tube, { type: 'tube2d', parameters: options });
        } catch (error: any) {
            console.error('[LocalCAD] Error creating Tube2D:', error);
            throw error;
        }
    }

    /**
     * Generates a complex parametric ShoppingCart assembly with optional Scooter and Robotic Arms.
     */
    async createShoppingCart(options: ShoppingCartOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        console.log('[LocalCAD] Creating Hybrid ShoppingCart with options:', JSON.stringify(options, null, 2));
        const { 
            basketLength = 60, basketWidth = 40, basketHeight = 30, wheelDiameter = 10, resolution = 64,
            hasScooter = false, hasArms = false, scooterLength = 100, armReach = 40, handlebarWidth = 50,
            basketDensity = 50, scooterWidth = 35, wheelArmReach = 30, 
            suspensionHeight = 15, suspensionOffset = 30, basketFloorHeight = 20
        } = options;
        const tubeRadius = resolution < 32 ? 1.5 : 1; // Adjust visual weight for low res
        const wheelRadius = wheelDiameter / 2;
        // 1. BASKET (Wireframe with walls - Optimized for memory)
        // gridSpacing: 0% -> 60mm (very sparse), 100% -> 4mm (very dense)
        const gridSpacing = Math.max(4, 60 - (basketDensity / 100) * 56); 
        const wallRods: any[] = [];
        const baseRods: any[] = [];

        const segments = Math.max(4, Math.floor(resolution / 8)); // Scaled segments for rods

        const numY = Math.max(1, Math.round(basketWidth / gridSpacing));
        const numZ = Math.max(1, Math.round(basketHeight / gridSpacing));
        const numX = Math.max(1, Math.round(basketLength / gridSpacing));

        // Longitudinal rods (along Length / X)
        for (let i = 0; i <= numY; i++) {
            const y = -basketWidth / 2 + (i / numY) * basketWidth;
            for (let j = 0; j <= numZ; j++) {
                const z = (j / numZ) * basketHeight;
                if (j === 0 || i === 0 || i === numY) {
                    const rod = primitives.cylinder({ radius: tubeRadius / 4, height: basketLength, segments });
                    const translated = transforms.translate([0, y, z], transforms.rotateY(Math.PI / 2, rod));
                    (j === 0 ? baseRods : wallRods).push(translated);
                }
            }
        }
        // Lateral rods (along Width / Y)
        for (let i = 0; i <= numX; i++) {
            const x = -basketLength / 2 + (i / numX) * basketLength;
            for (let j = 0; j <= numZ; j++) {
                const z = (j / numZ) * basketHeight;
                if (j === 0 || i === 0 || i === numX) {
                    const rod = primitives.cylinder({ radius: tubeRadius / 4, height: basketWidth, segments });
                    const translated = transforms.translate([x, 0, z], transforms.rotateX(Math.PI / 2, rod));
                    (j === 0 ? baseRods : wallRods).push(translated);
                }
            }
        }
        // Vertical rods (along Height / Z)
        for (let i = 0; i <= numX; i++) {
            const x = -basketLength / 2 + (i / numX) * basketLength;
            for (let j = 0; j <= numY; j++) {
                const y = -basketWidth / 2 + (j / numY) * basketWidth;
                if (i === 0 || i === numX || j === 0 || j === numY) {
                    const rod = primitives.cylinder({ radius: tubeRadius / 4, height: basketHeight, segments });
                    wallRods.push(transforms.translate([x, y, basketHeight / 2], rod));
                }
            }
        }

        // 2. FRAME (Minimal frame to support the basket)
        const frameRods: any[] = [];
        const handleHeight = basketHeight + 15;
        
        // Vertical support rods (Now only for handle and rear attachment)
        const rearCorners: [number, number][] = [
            [-basketLength / 2, -basketWidth / 2],
            [-basketLength / 2, basketWidth / 2]
        ];

        for (const [x, y] of rearCorners) {
            const rod = primitives.cylinder({ radius: tubeRadius, height: handleHeight, segments });
            frameRods.push(transforms.translate([x, y, handleHeight / 2], rod));
        }

        const handle = primitives.cylinder({ radius: tubeRadius * 1.2, height: basketWidth + tubeRadius * 2, segments });
        frameRods.push(transforms.translate([-basketLength / 2, 0, handleHeight], transforms.rotateX(Math.PI / 2, handle)));

        // 3. ASSEMBLY BASE
        const basketUnion = booleans.union(...baseRods, ...wallRods);
        const frameUnion = booleans.union(...frameRods);

        let assembly = booleans.union(basketUnion, frameUnion);

        // --- BASKET ELEVATION ---
        // Lift the basket to the floor height
        assembly = transforms.translate([0, 0, basketFloorHeight], assembly);

        // 4. SCOOTER EVOLUTION & SUSPENSION
        if (hasScooter) {
            const scooterBaseWidth = scooterWidth;
            const scooterBaseHeight = 10;
            const wheelWidth = wheelRadius * 0.8;
            const wheelRes = Math.max(32, resolution);
            // suspensionHeight override removed to use parameter from options
            // Vertical offset of scooter base from the floor
            
            // Motor Platform - Shortened and offset back to avoid steering collision
            const platformLen = scooterLength * 0.82;
            let platformGeom = primitives.cuboid({ size: [platformLen, scooterBaseWidth, scooterBaseHeight] });
            
            // Rear Wheel Well (Boolean subtraction to avoid intersection)
            const rearWheelXRelative = (scooterLength/2 - 10) - (scooterLength/2 - platformLen/2);
            const wellRadius = wheelRadius * 1.5;
            const wellGap = wheelWidth + 8;
            const wheelWellCutout = transforms.translate([rearWheelXRelative, 0, -scooterBaseHeight/2], 
                transforms.rotateX(Math.PI/2, primitives.cylinder({ radius: wellRadius, height: wellGap, segments: 16 }))
            );
            platformGeom = booleans.subtract(platformGeom, wheelWellCutout);

            // Axle mounts (Structural brackets for the rear wheel)
            const mountRadius = wheelRadius * 0.5;
            const mountWidth = 4;
            const leftMount = transforms.translate([rearWheelXRelative, -wellGap/2 + mountWidth/2, -scooterBaseHeight/2],
                transforms.rotateX(Math.PI/2, primitives.cylinder({ radius: mountRadius, height: mountWidth, segments: 16 }))
            );
            const rightMount = transforms.translate([rearWheelXRelative, wellGap/2 - mountWidth/2, -scooterBaseHeight/2],
                transforms.rotateX(Math.PI/2, primitives.cylinder({ radius: mountRadius, height: mountWidth, segments: 16 }))
            );
            const platform = booleans.union(platformGeom, leftMount, rightMount);

            // Central support bridging platform to basket (Scooter body is the skeleton now)
            // Pillar removed per user request: "We don't need central pillar"

            // Wheels (Main Drive wheels on Scooter Base)
            const wheelGeom = primitives.cylinder({ radius: wheelRadius * 1.3, height: wheelWidth, segments: wheelRes });
            const rotatedWheel = transforms.rotateX(Math.PI/2, wheelGeom);
            
            // Scooter base height from floor is fixed, anchor moves
            const deckHeightFromFloor = wheelRadius; 
            const deck = transforms.translate([scooterLength/2 - platformLen/2, 0, deckHeightFromFloor + scooterBaseHeight/2], platform);

            const frontWheel = transforms.translate([-scooterLength/2, 0, wheelRadius], rotatedWheel);
            const rearWheel = transforms.translate([scooterLength/2 - 10, 0, wheelRadius], rotatedWheel);

            // Front Fork & Head Tube
            const forkLeg = primitives.cylinder({ radius: 2, height: wheelRadius * 3, segments: 16 });
            const forkLeft = transforms.translate([-scooterLength/2, -wheelWidth/2 - 2, wheelRadius * 2], forkLeg);
            const forkRight = transforms.translate([-scooterLength/2, wheelWidth/2 + 2, wheelRadius * 2], forkLeg);
            const forkTop = primitives.cylinder({ radius: 2.2, height: wheelWidth + 6, segments: 16 });
            const forkBridge = transforms.translate([-scooterLength/2, 0, wheelRadius * 3.5], transforms.rotateX(Math.PI/2, forkTop));
            
            // Diagonal structural member connecting steering to body
            const headTube = primitives.cylinder({ radius: 2.5, height: 40, segments: 16 });
            const diagonalSupport = transforms.translate([-scooterLength/2 + 10, 0, wheelRadius * 5], 
                transforms.rotateY(-Math.PI/6, headTube)
            );
            
            const fork = booleans.union(forkLeft, forkRight, forkBridge, diagonalSupport);

            // Steering Column
            const columnHeight = basketHeight + 20;
            const pillar = primitives.cylinder({ radius: 2.5, height: columnHeight - wheelRadius * 3, segments });
            const dashboard = primitives.cuboid({ size: [10, 15, 5] });
            
            const steering = booleans.union(
                transforms.translate([-scooterLength/2, 0, wheelRadius * 3.5 + (columnHeight - wheelRadius * 3)/2], pillar),
                transforms.translate([-scooterLength/2, 0, columnHeight], dashboard)
            );
            
            // Handlebars
            const handleBar = primitives.cylinder({ radius: 1.5, height: handlebarWidth, segments });
            const grips = transforms.translate([-scooterLength/2, 0, columnHeight - 2], transforms.rotateX(Math.PI/2, handleBar));
            
            // --- WHEEL ARMS SUSPENSION ---
            const createWheelArm = (isLeft: boolean) => {
                const xPos = scooterLength/2 + suspensionOffset; // Reference is the BACK (scooterLength/2). 0 means back, negative means toward stem.
                const yPos = isLeft ? -scooterBaseWidth/2 : scooterBaseWidth/2;
                const armSectionLen = wheelArmReach / 2;
                const jointRadius = 2.5;

                const shoulder = primitives.cylinder({ radius: jointRadius, height: 4, segments: 16 });
                const armUpper = primitives.cylinder({ radius: 1.8, height: armSectionLen, segments: 16 });
                const elbow = primitives.sphere({ radius: jointRadius * 0.8, segments: 16 });
                const armLower = primitives.cylinder({ radius: 1.5, height: armSectionLen, segments: 16 });
                const hub = primitives.cylinder({ radius: 2, height: 4, segments: 16 });
                const outerWheel = primitives.cylinder({ radius: wheelRadius * 1.2, height: wheelRadius/2, segments: wheelRes });

                // Construct the articulated arm - Pointing FORWARD along X axis
                const arm = booleans.union(
                    transforms.rotateX(Math.PI/2, shoulder),
                    // Upper arm extends outwards
                    transforms.translate([0, isLeft ? -armSectionLen/2 : armSectionLen/2, 0], transforms.rotateX(Math.PI/2, armUpper)),
                    // Elbow joint
                    transforms.translate([0, isLeft ? -armSectionLen : armSectionLen, 0], elbow),
                    // Lower arm extends FORWARD along X
                    transforms.translate([armSectionLen/2, isLeft ? -armSectionLen : armSectionLen, 0], transforms.rotateY(Math.PI/2, armLower)),
                    // Hub and Wheel (Vertical and Parallel to travel)
                    transforms.translate([armSectionLen, isLeft ? -armSectionLen : armSectionLen, 0], hub),
                    transforms.translate([armSectionLen, isLeft ? -armSectionLen - (isLeft ? -2 : 2) : armSectionLen + (isLeft ? -2 : 2), 0], 
                        transforms.rotateX(Math.PI/2, outerWheel)
                    )
                );

                return transforms.translate([xPos, yPos, suspensionHeight], arm);
            };

            const suspension = booleans.union(
                createWheelArm(true), createWheelArm(false)
            );

            const scooterAssembly = booleans.union(deck, frontWheel, rearWheel, fork, steering, grips, suspension);
            assembly = booleans.union(assembly as any, scooterAssembly);
        }

        // 5. ROBOTIC ARMS (Optional)
        if (hasArms) {
            const armJointRadius = 3;
            const armSectionLen = armReach / 2;
            
            const createArm = (isLeft: boolean) => {
                const yPos = isLeft ? -basketWidth/2 : basketWidth/2;
                const shoulder = primitives.cylinder({ radius: armJointRadius, height: 6, segments });
                const armUpper = primitives.cylinder({ radius: 2, height: armSectionLen, segments });
                const elbow = primitives.sphere({ radius: armJointRadius * 0.8, segments });
                const armLower = primitives.cylinder({ radius: 1.5, height: armSectionLen, segments });
                const hand = primitives.cuboid({ size: [4, 6, 2] });

                // Mounting Plaque with 4 holes - Oriented in XZ plane (parallel to side wall)
                const plaqueWidth = 20;
                const plaqueHeight = 15;
                const plaqueThickness = 2;
                let plaque = primitives.cuboid({ size: [plaqueWidth, plaqueThickness, plaqueHeight] });
                
                // Add 4 bolt holes - Cutters oriented along Y axis
                const holeRadius = 1.0;
                const holeDistX = plaqueWidth/2 - 3;
                const holeDistZ = plaqueHeight/2 - 3;
                const holes = [
                    [holeDistX, holeDistZ], [holeDistX, -holeDistZ],
                    [-holeDistX, holeDistZ], [-holeDistX, -holeDistZ]
                ].map(([x, z]) => 
                    transforms.translate([x, 0, z], 
                        transforms.rotateX(Math.PI/2, primitives.cylinder({ radius: holeRadius, height: plaqueThickness + 2, segments: 8 }))
                    )
                );
                plaque = booleans.subtract(plaque, ...holes);

                return transforms.translate([0, yPos, basketHeight * 0.7], 
                    booleans.union(
                        transforms.translate([0, isLeft ? plaqueThickness/2 : -plaqueThickness/2, 0], plaque),
                        transforms.rotateX(Math.PI/2, shoulder),
                        transforms.translate([0, isLeft ? -armSectionLen/2 : armSectionLen/2, 0], transforms.rotateX(Math.PI/2, armUpper)),
                        transforms.translate([0, isLeft ? -armSectionLen : armSectionLen, 0], elbow),
                        transforms.translate([armSectionLen/2, isLeft ? -armSectionLen : armSectionLen, 0], transforms.rotateY(Math.PI/2, armLower)),
                transforms.translate([armSectionLen, isLeft ? -armSectionLen : armSectionLen, 0], hand)
                    )
                );
            };

            const armGroup = booleans.union(createArm(true), createArm(false));
            assembly = booleans.union(assembly as any, transforms.translate([0, 0, basketFloorHeight], armGroup));
        }

        assembly = transforms.rotateX(-Math.PI / 2, assembly);

        return this.saveModel(`shopping-cart-${Date.now()}`, assembly, { type: 'shopping-cart', parameters: options });
    }

    // Generates a high-performance parametric GoCart assembly.
    async createGoCart(options: GoCartOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        const { chassisLength, chassisWidth, wheelDiameter, seatHeight, resolution = 64 } = options;
        const tubeRadius = 2;
        const wheelRadius = wheelDiameter / 2;
        const wheelWidth = wheelRadius * 0.8;
        const segments = Math.max(8, Math.floor(resolution / 4));

        // 1. CHASSIS (Rectangular tube frame with cross-bracing)
        const frameWidth = chassisWidth;
        const frameLength = chassisLength;

        const sideRail = primitives.cylinder({ radius: tubeRadius, height: frameLength, segments });
        const frontRail = primitives.cylinder({ radius: tubeRadius, height: frameWidth, segments });
        const backRail = primitives.cylinder({ radius: tubeRadius, height: frameWidth, segments });

        const chassis = booleans.union(
            transforms.translate([0, -frameWidth / 2, 0], transforms.rotateY(Math.PI / 2, sideRail)),
            transforms.translate([0, frameWidth / 2, 0], transforms.rotateY(Math.PI / 2, sideRail)),
            transforms.translate([-frameLength / 2, 0, 0], transforms.rotateX(Math.PI / 2, frontRail)),
            transforms.translate([frameLength / 2, 0, 0], transforms.rotateX(Math.PI / 2, backRail))
        );

        // AXLES
        const axleRadius = tubeRadius * 0.7;
        const frontAxle = primitives.cylinder({ radius: axleRadius, height: frameWidth + wheelWidth * 2, segments });
        const backAxle = primitives.cylinder({ radius: axleRadius, height: frameWidth + wheelWidth * 2, segments });

        const axles = booleans.union(
            transforms.translate([-frameLength * 0.4, 0, 0], transforms.rotateX(Math.PI / 2, frontAxle)),
            transforms.translate([frameLength * 0.4, 0, 0], transforms.rotateX(Math.PI / 2, backAxle))
        );

        // 2. SEAT (Bucket seat style)
        const seatBase = primitives.cuboid({ size: [frameLength * 0.35, frameWidth * 0.65, 3] });
        const seatBack = primitives.cuboid({ size: [3, frameWidth * 0.65, seatHeight] });
        const seatSide = primitives.cuboid({ size: [frameLength * 0.3, 3, seatHeight * 0.7] }); // Taller sides

        const seat = booleans.union(
            transforms.translate([frameLength * 0.05, 0, 3], seatBase),
            transforms.translate([frameLength * 0.22, 0, seatHeight / 2 + 3], transforms.rotateY(-Math.PI / 6, seatBack)),
            // Side supports positioned higher and angled
            transforms.translate([frameLength * 0.05, -frameWidth * 0.3, seatHeight * 0.3 + 3], transforms.rotateY(Math.PI / 12, seatSide)),
            transforms.translate([frameLength * 0.05, frameWidth * 0.3, seatHeight * 0.3 + 3], transforms.rotateY(Math.PI / 12, seatSide))
        );

        // 3. STEERING COLUMN & WHEEL
        const columnLen = seatHeight * 1.5;
        const column = primitives.cylinder({ radius: tubeRadius / 2, height: columnLen, segments });
        const steeringWheel = primitives.cylinder({ radius: frameWidth * 0.2, height: 3, segments: 24 });
        const columnAngle = Math.PI / 4;

        // Tilt and position column
        const steeringPos: [number, number, number] = [-frameLength * 0.15, 0, seatHeight * 0.5];
        const steering = booleans.union(
            transforms.translate(steeringPos, transforms.rotateY(columnAngle, column)),
            // Align steering wheel to end of column
            transforms.translate([
                steeringPos[0] - Math.sin(columnAngle) * columnLen / 2,
                0,
                steeringPos[2] + Math.cos(columnAngle) * columnLen / 2
            ], transforms.rotateY(columnAngle, steeringWheel))
        );

        // 4. WHEELS & BRAKES
        const wheels: any[] = [];
        const brakes: any[] = [];
        const offsets = [
            [-frameLength * 0.4, -frameWidth / 2 - wheelWidth / 2],
            [-frameLength * 0.4, frameWidth / 2 + wheelWidth / 2],
            [frameLength * 0.4, -frameWidth / 2 - wheelWidth / 2],
            [frameLength * 0.4, frameWidth / 2 + wheelWidth / 2]
        ];

        for (const [x, y] of offsets) {
            const tire = primitives.cylinder({ radius: wheelRadius, height: wheelWidth, segments: 24 });
            wheels.push(transforms.translate([x, y, 0], transforms.rotateX(Math.PI / 2, tire)));

            // Prominent Brake discs
            const disc = primitives.cylinder({ radius: wheelRadius * 0.75, height: 2, segments: 24 });
            const discY = y > 0 ? y - wheelWidth / 2 - 3 : y + wheelWidth / 2 + 3;
            brakes.push(transforms.translate([x, discY, 0], transforms.rotateX(Math.PI / 2, disc)));
        }

        // 5. ENGINE ASSEMBLY
        const block = primitives.cuboid({ size: [frameLength * 0.2, frameWidth * 0.4, seatHeight * 0.3] });
        const cylinder = primitives.cylinder({ radius: frameWidth * 0.1, height: seatHeight * 0.4, segments: 8 });
        const engine = booleans.union(
            transforms.translate([frameLength * 0.42, 0, seatHeight * 0.15], block),
            transforms.translate([frameLength * 0.45, frameWidth * 0.1, seatHeight * 0.4], cylinder),
            transforms.translate([frameLength * 0.45, -frameWidth * 0.1, seatHeight * 0.4], cylinder)
        );

        let assembly = booleans.union(chassis, axles, seat, steering, ...wheels, ...brakes, engine);

        // Final orientation
        assembly = transforms.rotateX(-Math.PI / 2, assembly);

        return this.saveModel(`go-cart-${Date.now()}`, assembly, { type: 'go-cart', parameters: options });
    }

    /**
     * Generates a parametric Bottle using revolve operation with smooth arcs and detailed neck.
     */
    async createBottle(options: BottleOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        console.log('[LocalCAD] Creating Smooth & Detailed Bottle with options:', options);
        const { bottomRadius, bodyHeight, shoulderHeight, neckRadius, neckHeight, wallThickness, resolution = 64 } = options;
        
        const fillet = Math.min(bottomRadius * 0.2, 5); 
        const segments = Math.max(16, Math.floor(resolution / 2)); // Increased from resolution/4
        const profilePoints: [number, number][] = [];

        // Helper to add points and avoid duplicates/gaps
        const addPoints = (pts: [number, number][]) => {
            for (const p of pts) {
                if (profilePoints.length > 0) {
                    const last = profilePoints[profilePoints.length - 1];
                    if (Math.abs(last[0] - p[0]) < 0.001 && Math.abs(last[1] - p[1]) < 0.001) continue;
                }
                profilePoints.push(p);
            }
        };

        const generateArc = (center: [number, number], radius: number, startAngle: number, endAngle: number, reverse = false) => {
            const pts: [number, number][] = [];
            for (let i = 0; i <= segments; i++) {
                const t = reverse ? (segments - i) / segments : i / segments;
                const ang = startAngle + (endAngle - startAngle) * t;
                pts.push([
                    center[0] + Math.cos(ang) * radius,
                    center[1] + Math.sin(ang) * radius
                ]);
            }
            return pts;
        };

        // 1. OUTER PROFILE
        addPoints([[0, 0]]);
        addPoints(generateArc([bottomRadius - fillet, fillet], fillet, -Math.PI / 2, 0));
        addPoints([[bottomRadius, bodyHeight]]);
        
        // Shoulder
        const shoulderR = bottomRadius - neckRadius;
        addPoints(generateArc([neckRadius, bodyHeight], shoulderR, 0, Math.PI / 2).map((p): [number, number] => [
            p[0],
            bodyHeight + (p[1] - bodyHeight) * (shoulderHeight / shoulderR)
        ]));

        // Neck & Mock Threads
        const neckTop = bodyHeight + shoulderHeight + neckHeight;
        const threadCount = 3;
        const threadR = 0.5;
        const threadPitch = 2.5;
        const threadStartY = neckTop - 5;

        for (let i = 0; i < threadCount; i++) {
            const z = threadStartY - (i * threadPitch);
            addPoints([[neckRadius, z + threadR]]);
            addPoints(generateArc([neckRadius, z], threadR, Math.PI / 2, -Math.PI / 2, true));
        }
        
        addPoints([[neckRadius, neckTop]]);
        
        // 2. INNER PROFILE (Reverse flow)
        addPoints([[neckRadius - wallThickness, neckTop]]);
        
        // Inner neck
        addPoints([[neckRadius - wallThickness, bodyHeight + shoulderHeight]]);
        
        // Inner shoulder
        const innerShoulderR = shoulderR - wallThickness;
        if (innerShoulderR > 0) {
            addPoints(generateArc([neckRadius, bodyHeight + wallThickness], innerShoulderR, Math.PI / 2, 0, true).map((p): [number, number] => [
                p[0],
                bodyHeight + wallThickness + (p[1] - (bodyHeight + wallThickness)) * ((shoulderHeight - wallThickness) / innerShoulderR)
            ]));
        } else {
            addPoints([[neckRadius - wallThickness, bodyHeight + wallThickness]]);
        }
        
        addPoints([[bottomRadius - wallThickness, bodyHeight]]);
        
        // Inner Bottom fillet
        if (fillet > wallThickness) {
            addPoints(generateArc([bottomRadius - fillet, fillet], fillet - wallThickness, 0, -Math.PI / 2, true));
        }
        addPoints([[0, wallThickness]]);

        const profile = primitives.polygon({ points: profilePoints });
        const bottle = extrusions.extrudeRotate({ angle: Math.PI * 2, segments: resolution }, profile);
        const assembly = transforms.rotateX(-Math.PI / 2, bottle);

        return this.saveModel(`bottle-${Date.now()}`, assembly, { type: 'bottle', parameters: options });
    }

    private generateShape2D(regions: any[]): any {
        if (regions.length === 0) return null;

        const shapes2d: any[] = [];
        for (const region of regions) {
            let shape: any = null;
            if (region.type === 'circle') {
                shape = primitives.circle({ center: region.points[0], radius: region.radius, segments: 64 });
            } else if (region.type === 'rectangle' || region.type === 'center-rectangle') {
                const [p1, p2] = region.points;
                let minX, maxX, minY, maxY;
                if (region.type === 'rectangle') {
                    minX = Math.min(p1[0], p2[0]); maxX = Math.max(p1[0], p2[0]);
                    minY = Math.min(p1[1], p2[1]); maxY = Math.max(p1[1], p2[1]);
                } else {
                    const dx = Math.abs(p2[0] - p1[0]); const dy = Math.abs(p2[1] - p1[1]);
                    minX = p1[0] - dx; maxX = p1[0] + dx; minY = p1[1] - dy; maxY = p1[1] + dy;
                }
                shape = primitives.rectangle({ center: [(minX + maxX) / 2, (minY + maxY) / 2], size: [maxX - minX, maxY - minY] });
            } else if (region.type === 'polygon') {
                if (region.points && region.points.length >= 3) {
                    shape = primitives.polygon({ points: region.points });
                } else if (region.radius && region.sides) {
                    const pts: [number, number][] = [];
                    const startAngle = 0;
                    const cx = region.points?.[0]?.[0] ?? 0;
                    const cy = region.points?.[0]?.[1] ?? 0;
                    for (let i = 0; i < region.sides; i++) {
                        const ang = startAngle + (i / region.sides) * Math.PI * 2;
                        pts.push([
                            cx + Math.cos(ang) * region.radius,
                            cy + Math.sin(ang) * region.radius
                        ]);
                    }
                    shape = primitives.polygon({ points: pts });
                }
            } else if (region.type === 'loop') {
                const elements = [...region.elements];
                const segments: any[] = [];
                if (elements.length > 0) {
                    let first = elements.shift()!;
                    segments.push(first);

                    // Walk forward
                    let lastPoint = first.points[1];
                    let foundForward = true;
                    while (foundForward) {
                        const idx = elements.findIndex((el: any) =>
                            (Math.abs(el.points[0][0] - lastPoint[0]) < 0.5 && Math.abs(el.points[0][1] - lastPoint[1]) < 0.5) ||
                            (Math.abs(el.points[1][0] - lastPoint[0]) < 0.5 && Math.abs(el.points[1][1] - lastPoint[1]) < 0.5)
                        );
                        if (idx !== -1) {
                            const el = elements.splice(idx, 1)[0];
                            const isReversed = (Math.abs(el.points[1][0] - lastPoint[0]) < 0.5 && Math.abs(el.points[1][1] - lastPoint[1]) < 0.5);
                            const oriented = isReversed ? { ...el, points: [el.points[1], el.points[0], ...el.points.slice(2)] } : el;
                            segments.push(oriented);
                            lastPoint = oriented.points[1];
                        } else {
                            foundForward = false;
                        }
                    }

                    // Walk backward
                    let firstPoint = first.points[0];
                    let foundBackward = true;
                    while (foundBackward) {
                        const idx = elements.findIndex((el: any) =>
                            (Math.abs(el.points[0][0] - firstPoint[0]) < 0.5 && Math.abs(el.points[0][1] - firstPoint[1]) < 0.5) ||
                            (Math.abs(el.points[1][0] - firstPoint[0]) < 0.5 && Math.abs(el.points[1][1] - firstPoint[1]) < 0.5)
                        );
                        if (idx !== -1) {
                            const el = elements.splice(idx, 1)[0];
                            const isForward = (Math.abs(el.points[1][0] - firstPoint[0]) < 0.5 && Math.abs(el.points[1][1] - firstPoint[1]) < 0.5);
                            const oriented = isForward ? el : { ...el, points: [el.points[1], el.points[0], ...el.points.slice(2)] };
                            segments.unshift(oriented);
                            firstPoint = oriented.points[0];
                        } else {
                            foundBackward = false;
                        }
                    }
                }

                const loopPoints: [number, number][] = [];
                segments.forEach((el: any) => {
                    const normalizedPoints = el.type === 'polyline' ? el.points : [el.points[0], el.points[1]];

                    if (el.type === 'line' || el.type === 'polyline') {
                        // Add all points except the last one (since the last one is the start of the next or the closure)
                        for (let i = 0; i < normalizedPoints.length - 1; i++) {
                            loopPoints.push(normalizedPoints[i]);
                        }
                    } else if (el.type === 'arc' && normalizedPoints.length >= 3) {
                        const p1 = normalizedPoints[0], p2 = normalizedPoints[1], p3 = normalizedPoints[2];
                        const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1], x3 = p3[0], y3 = p3[1];
                        const D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
                        if (Math.abs(D) > 0.0001) {
                            const cx = ((x1 * x1 + y1 * y1) * (y2 - y3) + (x2 * x2 + y2 * y2) * (y3 - y1) + (x3 * x3 + y3 * y3) * (y1 - y2)) / D;
                            const cy = ((x1 * x1 + y1 * y1) * (x3 - x2) + (x2 * x2 + y2 * y2) * (x1 - x3) + (x3 * x3 + y3 * y3) * (x2 - x1)) / D;
                            const radius = Math.sqrt((x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy));
                            const startAngle = Math.atan2(y1 - cy, x1 - cx);
                            const endAngle = Math.atan2(y2 - cy, x2 - cx);
                            const midAngle = Math.atan2(y3 - cy, x3 - cx);
                            let diff = endAngle - startAngle;
                            while (diff < 0) diff += Math.PI * 2;
                            let midDiff = midAngle - startAngle;
                            while (midDiff < 0) midDiff += Math.PI * 2;
                            const clockWise = midDiff > (diff % (Math.PI * 2));
                            const steps = 12;
                            for (let i = 0; i < steps; i++) { // Go to steps-1 so we don't duplicate end point
                                const t = i / steps;
                                const ang = clockWise
                                    ? startAngle - (startAngle - (endAngle < startAngle ? endAngle : endAngle - Math.PI * 2)) * t
                                    : startAngle + diff * t;
                                loopPoints.push([cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius]);
                            }
                        } else {
                            loopPoints.push(normalizedPoints[0]);
                        }
                    }
                });

                // Add the very last point to close the loop
                if (segments.length > 0) {
                    const lastSeg = segments[segments.length - 1];
                    const pts = lastSeg.type === 'polyline' ? lastSeg.points : [lastSeg.points[0], lastSeg.points[1]];
                    loopPoints.push(pts[pts.length - 1]);
                }
                const uniquePoints: [number, number][] = [];
                loopPoints.forEach(p => {
                    if (uniquePoints.length === 0 || Math.hypot(p[0] - uniquePoints[uniquePoints.length - 1][0], p[1] - uniquePoints[uniquePoints.length - 1][1]) > 0.001) {
                        uniquePoints.push(p);
                    }
                });
                if (uniquePoints.length >= 3) {
                    shape = primitives.polygon({ points: uniquePoints });
                }
            }
            if (shape) shapes2d.push(shape);
        }

        if (shapes2d.length === 0) return null;

        const sortedByArea = shapes2d.sort((a, b) => {
            const bA = measurements.measureBoundingBox(a);
            const bB = measurements.measureBoundingBox(b);
            const areaA = (bA[1][0] - bA[0][0]) * (bA[1][1] - bA[0][1]);
            const areaB = (bB[1][0] - bB[0][0]) * (bB[1][1] - bB[0][1]);
            return areaB - areaA;
        });

        let result2d = sortedByArea[0];
        for (let i = 1; i < sortedByArea.length; i++) {
            result2d = booleans.subtract(result2d, sortedByArea[i]);
        }
        return result2d;
    }

    /**
     * Generates a high-performance custom model from a series of CAD operations.
     */
    async createCustomModel(id: string, name: string, operations: any[]): Promise<{ id: string; url: string; stlUrl: string }> {
        console.log(`[LocalCAD] Creating Custom Model: ${name} (${id})`);

        let finalAssembly: any = null;

        for (const op of operations) {
            if (op.type === 'extrude') {
                const { depth = 10, direction = 'pos', opType = 'add', plane = 'alzado', offset = 0 } = op.params;
                const result2d = this.generateShape2D(op.sketch || []);
                if (!result2d) continue;

                let extruded = extrusions.extrudeLinear({ height: depth }, result2d);

                // Handle direction offset
                let zOffset = offset;
                if (direction === 'neg') zOffset -= depth;
                else if (direction === 'mid') zOffset -= depth / 2;
                if (zOffset !== 0) {
                    extruded = transforms.translate([0, 0, zOffset], extruded);
                }

                // Align to plane (Match frontend rotations)
                if (plane === 'planta') {
                    extruded = transforms.rotateX(-Math.PI / 2, extruded);
                } else if (plane === 'lateral') {
                    extruded = transforms.rotateY(Math.PI / 2, extruded);
                }

                if (!finalAssembly) {
                    finalAssembly = extruded;
                } else {
                    if (opType === 'add') {
                        finalAssembly = booleans.union(finalAssembly, extruded);
                    } else {
                        finalAssembly = booleans.subtract(finalAssembly, extruded);
                    }
                }
            } else if (op.type === 'revolve') {
                const { angle = 360, axisId = 'y', opType = 'add', plane = 'alzado', offset = 0 } = op.params;
                let result2d = this.generateShape2D(op.sketch || []);
                if (!result2d) continue;

                // JSCAD revolves around the Z axis.
                // Our frontend revolves around X or Y of the sketch.
                // Sketch plane is XY in both cases.

                let shapeForRotate = result2d;
                if (axisId === 'x') {
                    // To revolve around X in JSCAD (which revolves around Z), we rotate the 2D shape so X becomes the revolution axis
                    // Actually, if we rotate 2D shape 90deg, Y becomes X.
                    shapeForRotate = transforms.rotateZ(Math.PI / 2, shapeForRotate);
                }

                let revolved = extrusions.extrudeRotate({ angle: (angle * Math.PI) / 180, segments: 64 }, shapeForRotate);

                // Now it's revolved around Z.
                // Apply offset in Z
                if (offset !== 0) {
                    revolved = transforms.translate([0, 0, offset], revolved);
                }

                // We need to re-orient the 3D solid so the Z-axis aligns with the intended sketch axis.
                if (axisId === 'x') {
                    // Turn Z into X
                    revolved = transforms.rotateY(Math.PI / 2, revolved);
                } else {
                    // Turn Z into Y (Match LatheGeometry behavior)
                    // If we revolved the original shape around Z, 
                    // and we want it to look like it revolved around Y in our coordinate system:
                    revolved = transforms.rotateX(-Math.PI / 2, revolved);
                }

                // Then apply plane rotations
                if (plane === 'planta') {
                    revolved = transforms.rotateX(-Math.PI / 2, revolved);
                } else if (plane === 'lateral') {
                    revolved = transforms.rotateY(Math.PI / 2, revolved);
                }

                if (!finalAssembly) {
                    finalAssembly = revolved;
                } else {
                    if (opType === 'add') {
                        finalAssembly = booleans.union(finalAssembly, revolved);
                    } else {
                        finalAssembly = booleans.subtract(finalAssembly, revolved);
                    }
                }
            }
        }

        if (!finalAssembly) {
            // Create a small placeholder if nothing was extruded
            finalAssembly = primitives.cuboid({ size: [1, 1, 1] });
        }

        return this.saveModel(id, finalAssembly, { type: 'custom', name, parameters: { operations } });
    }

    private async saveModel(id: string, geometry: any, metadata: any): Promise<{ id: string; url: string; stlUrl: string }> {
        try {
            const stlData = serialize({ binary: true }, geometry);
            const stlPath = path.join(this.modelsDir, `${id}.stl`);
            const jsonPath = path.join(this.modelsDir, `${id}.json`);
            const combinedBuffer = Buffer.concat(stlData.map((chunk: any) => Buffer.from(chunk)));
            fs.writeFileSync(stlPath, combinedBuffer);
            metadata.stlUrl = `/models/${id}.stl`;
            metadata.timestamp = new Date().toISOString();
            fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
            return { id, url: `/models/${id}.json`, stlUrl: `/models/${id}.stl` };
        } catch (error: any) {
            console.error('[LocalCAD] Error saving Model:', error);
            throw error;
        }
    }

    /**
     * Generates a dedicated Scooter assembly for isolated testing.
     */
    async createScooter(options: ScooterOptions): Promise<{ id: string; url: string; stlUrl: string }> {
        console.log('[LocalCAD] Creating Isolated Scooter with options:', JSON.stringify(options, null, 2));
        const { 
            scooterLength = 100, handlebarWidth = 50, resolution = 64
        } = options;
        
        const segments = Math.max(8, Math.floor(resolution / 4));
        const legHeight = 30;
        const basketHeight = 30;
        const wheelRadius = 5;
        const wheelWidth = 4;

        // Platform
        const scooterBaseWidth = 30;
        const scooterBaseHeight = 10;
        const platform = primitives.cuboid({ size: [scooterLength, scooterBaseWidth, scooterBaseHeight] });
        const deck = transforms.translate([0, 0, scooterBaseHeight/2], platform);
        
        // Front Motor/Mudguard
        const housing = primitives.cylinder({ radius: wheelRadius * 1.8, height: wheelWidth + 8, segments });
        const frontHousing = transforms.translate([-scooterLength/2, 0, wheelRadius], transforms.rotateX(Math.PI/2, housing));
        
        // Steering Column
        const columnHeight = legHeight + basketHeight + 20;
        const pillar = primitives.cylinder({ radius: 2.5, height: columnHeight, segments });
        const dashboard = primitives.cuboid({ size: [10, 15, 5] });
        
        const steering = booleans.union(
            transforms.translate([-scooterLength/2 + 5, 0, columnHeight/2], pillar),
            transforms.translate([-scooterLength/2 + 5, 0, columnHeight], dashboard)
        );
        
        // Handlebars
        const handleBar = primitives.cylinder({ radius: 1.5, height: handlebarWidth, segments });
        const grips = transforms.translate([-scooterLength/2 + 5, 0, columnHeight - 2], transforms.rotateX(Math.PI/2, handleBar));
        
        const assembly = booleans.union(deck, frontHousing, steering, grips);
        const oriented = transforms.rotateX(-Math.PI / 2, assembly);

        return this.saveModel(`scooter-${Date.now()}`, oriented, { type: 'scooter', parameters: options });
    }
}
