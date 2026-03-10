import { primitives, geometries } from '@jscad/modeling'

const cone = primitives.cylinderElliptic({
    startRadius: [1, 1], // Suspected Narrow
    endRadius: [10, 10], // Suspected Wide
    height: 10
})

const polygons = geometries.geom3.toPolygons(cone)
let minZ = 100
let maxZ = -100

polygons.forEach(poly => {
    poly.vertices.forEach(v => {
        if (v[2] < minZ) minZ = v[2]
        if (v[2] > maxZ) maxZ = v[2]
    })
})

console.log(`Z Range: ${minZ} to ${maxZ}`)

// Find vertices at minZ
let radiiAtMinZ = []
polygons.forEach(poly => {
    poly.vertices.forEach(v => {
        if (Math.abs(v[2] - minZ) < 0.01) {
            const r = Math.sqrt(v[0] * v[0] + v[1] * v[1])
            if (!radiiAtMinZ.includes(r)) radiiAtMinZ.push(r)
        }
    })
})

console.log(`Radii at minZ (${minZ}):`, radiiAtMinZ)

// Find vertices at maxZ
let radiiAtMaxZ = []
polygons.forEach(poly => {
    poly.vertices.forEach(v => {
        if (Math.abs(v[2] - maxZ) < 0.01) {
            const r = Math.sqrt(v[0] * v[0] + v[1] * v[1])
            if (!radiiAtMaxZ.includes(r)) radiiAtMaxZ.push(r)
        }
    })
})

console.log(`Radii at maxZ (${maxZ}):`, radiiAtMaxZ)
