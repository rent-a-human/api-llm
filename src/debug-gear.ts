import { primitives, booleans, transforms, extrusions, geometries, measurements } from '@jscad/modeling';
// @ts-ignore
import { serialize } from '@jscad/stl-serializer';
import fs from 'fs';

function createGearPoints(teeth: number, module: number, pressureAngle: number) {
    const alpha = (pressureAngle * Math.PI) / 180;
    const pr = (teeth * module) / 2;
    const br = pr * Math.cos(alpha);
    const ar = pr + module;
    const dr = pr - 1.25 * module;

    const invAlpha = Math.tan(alpha) - alpha;
    const halfPitchAngle = (Math.PI / 2) / teeth;
    const halfToothBaseAngle = halfPitchAngle + invAlpha;

    const points: [number, number][] = [];
    const toothAngleStep = (Math.PI * 2) / teeth;

    for (let i = 0; i < teeth; i++) {
        const centerAngle = i * toothAngleStep;

        // Root Boundary (Gap)
        points.push([
            dr * Math.cos(centerAngle - toothAngleStep / 2),
            dr * Math.sin(centerAngle - toothAngleStep / 2)
        ]);

        const startRadius = Math.max(br, dr);

        // Side 1 Down (Involute root-to-tip)
        const sideSteps = 5;
        for (let s = 0; s <= sideSteps; s++) {
            const r = startRadius + (ar - startRadius) * (s / sideSteps);
            const a_r = Math.acos(br / r);
            const i_r = Math.tan(a_r) - a_r;
            const theta = halfToothBaseAngle - i_r;
            points.push([
                r * Math.cos(centerAngle - theta),
                r * Math.sin(centerAngle - theta)
            ]);
        }

        // Side 2 Up (Involute tip-to-root)
        for (let s = sideSteps; s >= 0; s--) {
            const r = startRadius + (ar - startRadius) * (s / sideSteps);
            const a_r = Math.acos(br / r);
            const i_r = Math.tan(a_r) - a_r;
            const theta = halfToothBaseAngle - i_r;
            points.push([
                r * Math.cos(centerAngle + theta),
                r * Math.sin(centerAngle + theta)
            ]);
        }
    }
    return points;
}

const points = createGearPoints(20, 2, 20);
console.log('Points count:', points.length);
console.log('First 5 points:', points.slice(0, 5));
console.log('Any NaN?:', points.some(p => isNaN(p[0]) || isNaN(p[1])));

try {
    const gear2d = primitives.polygon({ points });
    console.log('2D Polygon created');

    const gear3d = extrusions.extrudeLinear({ height: 10 }, gear2d);
    console.log('3D Extrusion created');

    const bbox = measurements.measureBoundingBox(gear3d);
    console.log('Bounding Box:', bbox);

    const stl = serialize({ binary: true }, gear3d);
    fs.writeFileSync('test-gear.stl', Buffer.concat(stl.map((c: any) => Buffer.from(c))));
    console.log('STL written to test-gear.stl');
} catch (e: any) {
    console.error('Error in JSCAD:', e.message);
}
