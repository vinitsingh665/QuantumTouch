/** * CONFIGURATION
 */
const PARTICLE_COUNT = 15000;
const PARTICLE_SIZE = 0.08;
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

/**
 * THREE.JS SETUP
 */
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const camera = new THREE.PerspectiveCamera(
    75,
    CANVAS_WIDTH / CANVAS_HEIGHT,
    0.1,
    1000
);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

/**
 * PARTICLE SYSTEM
 */
// We store positions in two arrays: current (displayed) and target (desired shape)
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);

const colorObj = new THREE.Color();

for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Init random positions
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

    // Init white color
    colors[i * 3] = 1;
    colors[i * 3 + 1] = 1;
    colors[i * 3 + 2] = 1;
}

geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
);
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: PARTICLE_SIZE,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.8,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

/**
 * SHAPE GENERATORS (Math)
 */
function getSpherePoint(u, v, r) {
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
    };
}

function generateShape(type) {
    const tempColor = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const u = Math.random();
        const v = Math.random();
        let x, y, z;

        // 1. HEART
        if (type === "heart") {
            // Heart Parametrics
            const t = Math.PI * (Math.random() * 2 - 1); // -PI to PI
            const phi = Math.random() * Math.PI;
            // 3D Heart approximation
            x = 16 * Math.pow(Math.sin(t), 3) * Math.sin(phi);
            y =
                (13 * Math.cos(t) -
                    5 * Math.cos(2 * t) -
                    2 * Math.cos(3 * t) -
                    Math.cos(4 * t)) *
                Math.sin(phi);
            z = 10 * Math.cos(phi);

            // Color: Red/Pink gradients
            tempColor.setHSL(0.9 + Math.random() * 0.1, 1, 0.5);
        }

        // 2. SATURN
        else if (type === "saturn") {
            if (i < PARTICLE_COUNT * 0.3) {
                // Planet Body
                const p = getSpherePoint(u, v, 8);
                x = p.x;
                y = p.y;
                z = p.z;
                tempColor.setHSL(0.1, 0.8, 0.5); // Orange
            } else {
                // Rings
                const angle = Math.random() * Math.PI * 2;
                const radius = 12 + Math.random() * 8;
                x = Math.cos(angle) * radius;
                y = (Math.random() - 0.5) * 1; // Thin Y
                z = Math.sin(angle) * radius;

                // Tilt the ring
                const tilt = 0.4;
                const ty = y * Math.cos(tilt) - z * Math.sin(tilt);
                const tz = y * Math.sin(tilt) + z * Math.cos(tilt);
                y = ty;
                z = tz;

                tempColor.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.7); // Blue/Cyan rings
            }
        }

        // 3. FLOWER
        else if (type === "flower") {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 10 * (1 + 0.5 * Math.sin(5 * theta) * Math.sin(phi)); // 5 petals
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);

            tempColor.setHSL(Math.random(), 1, 0.6); // Rainbow
        }

        // 4. FIREWORKS
        else if (type === "fireworks") {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            // Spiral arms
            const r = Math.pow(Math.random(), 1 / 3) * 15;
            const spiral = 2; // twist
            x = r * Math.sin(phi) * Math.cos(theta + r * spiral);
            y = r * Math.sin(phi) * Math.sin(theta + r * spiral);
            z = r * Math.cos(phi);
            tempColor.setHSL(0.15, 1, 0.6); // Gold/Yellow
        }

        // 5. SPHERE (Default for Set A)
        else if (type === "sphere") {
            const p = getSpherePoint(u, v, 12);
            x = p.x; y = p.y; z = p.z;
            tempColor.setHSL(0.6, 1, 0.5); // Blue
        }

        // --- SET B SHAPES ---

        // 6. HELIX (DNA)
        else if (type === "helix") {
            const t = (i / PARTICLE_COUNT) * Math.PI * 10 - Math.PI * 5; // Height
            const r = 8;
            // Double Strand
            const isStrand2 = i % 2 === 0;
            const phase = isStrand2 ? Math.PI : 0;

            x = r * Math.cos(t + phase);
            z = r * Math.sin(t + phase);
            y = t * 2; // Stretch vertically

            // Add some noise or "rungs" connecting them? 
            // Let's just do thick strands
            x += (Math.random() - 0.5);
            z += (Math.random() - 0.5);
            y += (Math.random() - 0.5);

            tempColor.setHSL(isStrand2 ? 0.3 : 0.8, 1, 0.5); // Green & Purple
        }

        // 7. GALACTIC SPIRAL (Vortex)
        else if (type === "spiral") {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 0.5) * 20; // Bias towards center
            const arms = 3;
            // const armOffset = Math.sin(radius * 0.2 + angle * arms); // Not used in final

            x = radius * Math.cos(angle + radius * 0.1);
            y = (Math.random() - 0.5) * (20 - radius) * 0.2; // Bulge in center
            z = radius * Math.sin(angle + radius * 0.1);

            tempColor.setHSL(0.6 + radius * 0.02, 0.8, 0.6);
        }

        // 8. CUBE
        else if (type === "cube") {
            const size = 15;
            // Volume distribution
            x = (Math.random() - 0.5) * size * 2;
            y = (Math.random() - 0.5) * size * 2;
            z = (Math.random() - 0.5) * size * 2;

            tempColor.setHSL(Math.random(), 0.2, 0.8); // White/Pastel noise
        }

        // 9. STAR
        else if (type === "star") {
            // Simple Parametric Star (2D extruded?) or 3D spikes
            // Let's do a spiked sphere
            const p = getSpherePoint(u, v, 1);
            // Spike function
            // r = 10 + 5 * sin(10*theta) * sin(10*phi)... simplified:
            // Just push out based on direction
            const rBase = 8;
            const spikes = Math.pow(Math.sin(u * Math.PI * 10) * Math.sin(v * Math.PI * 10), 2) * 15;
            const r = rBase + spikes;

            x = p.x * r;
            y = p.y * r;
            z = p.z * r;

            tempColor.setHSL(0.14, 1, 0.6); // Gold
        }

        // 10. TORUS
        else if (type === "torus") {
            const majorR = 12;
            const minorR = 4;
            const u2 = u * Math.PI * 2;
            const v2 = v * Math.PI * 2;

            x = (majorR + minorR * Math.cos(v2)) * Math.cos(u2);
            z = (majorR + minorR * Math.cos(v2)) * Math.sin(u2);
            y = minorR * Math.sin(v2);

            tempColor.setHSL(u, 1, 0.5); // Rainbow Ring
        }

        // --- SET C SHAPES (EXPERT) ---

        // 11. PYRAMID
        else if (type === "pyramid") {
            const h = 20;
            const base = 15;
            // y goes from -h/2 to h/2
            y = (Math.random() - 0.5) * h;
            const progress = (y + h / 2) / h; // 0 (base) to 1 (tip)
            const currentScale = (1 - progress) * base; // Wide at base, 0 at tip

            x = (Math.random() - 0.5) * 2 * currentScale;
            z = (Math.random() - 0.5) * 2 * currentScale;

            tempColor.setHSL(0.1, 1, 0.5); // Orange/Yellow
        }

        // 12. HOURGLASS
        else if (type === "hourglass") {
            const h = 20;
            const rMax = 10;
            y = (Math.random() - 0.5) * h;
            // Radius is function of distance from center y=0
            const rCurrent = (Math.abs(y) / (h / 2)) * rMax;
            const theta = Math.random() * Math.PI * 2;
            const rRandom = Math.sqrt(Math.random()) * rCurrent; // Fill circle

            x = rRandom * Math.cos(theta);
            z = rRandom * Math.sin(theta);

            tempColor.setHSL(0.5 + y / h * 0.5, 0.8, 0.6); // Cyan gradient
        }

        // 13. ATOM
        else if (type === "atom") {
            if (i < PARTICLE_COUNT * 0.2) {
                // Nucleus
                const p = getSpherePoint(u, v, 3);
                x = p.x; y = p.y; z = p.z;
                tempColor.setHSL(0.1, 1, 0.5);
            } else {
                // Electrons - 3 orbits
                const orbit = i % 3;
                const theta = Math.random() * Math.PI * 2;
                const r = 12 + (Math.random() - 0.5);

                let rx = r * Math.cos(theta);
                let ry = 0;
                let rz = r * Math.sin(theta);

                // Rotate orbits
                // Orbit 0: Flat
                if (orbit === 1) { // 60 deg X
                    let cy = ry * Math.cos(Math.PI / 3) - rz * Math.sin(Math.PI / 3);
                    let cz = ry * Math.sin(Math.PI / 3) + rz * Math.cos(Math.PI / 3);
                    ry = cy; rz = cz;
                } else if (orbit === 2) { // 120 deg X
                    let cy = ry * Math.cos(2 * Math.PI / 3) - rz * Math.sin(2 * Math.PI / 3);
                    let cz = ry * Math.sin(2 * Math.PI / 3) + rz * Math.cos(2 * Math.PI / 3);
                    ry = cy; rz = cz;
                }

                x = rx; y = ry; z = rz;
                tempColor.setHSL(0.6, 1, 0.7); // Cyan electrons
            }
        }

        // 14. TORNADO
        else if (type === "tornado") {
            const h = 25;
            const turns = 5;
            const t = Math.random() * turns * Math.PI * 2;
            // y is related to t
            y = (t / (turns * Math.PI * 2)) * h - h / 2;
            const r = 2 + (y + h / 2) * 0.5; // Radius gets bigger higher up

            // Add width to the funnel wall
            const rWidth = r + (Math.random() - 0.5) * 2;

            x = rWidth * Math.cos(t);
            z = rWidth * Math.sin(t);

            tempColor.setHSL(0.0, 0.0, 0.4 + (y / h + 0.5) * 0.5); // Grey to White
        }

        // 15. RIBBON (Möbius)
        else if (type === "ribbon") {
            const t = u * Math.PI * 2; // 0 to 2PI
            const w = 3;  // width
            const s = (v - 0.5) * 2 * w; // -w to w
            const R = 10;

            x = (R + s * Math.cos(t / 2)) * Math.cos(t);
            y = (R + s * Math.cos(t / 2)) * Math.sin(t);
            z = s * Math.sin(t / 2);

            tempColor.setHSL(u, 1, 0.5); // Rainbow loop
        }

        // --- SET D SHAPES (COSMIC) ---

        // 16. WAVE
        else if (type === "wave") {
            const width = 30;
            const depth = 30;
            x = (u - 0.5) * width;
            z = (v - 0.5) * depth;
            // Sine wave based on x and z
            y = Math.sin(x * 0.5) * 2 + Math.cos(z * 0.5) * 2;

            tempColor.setHSL(0.5 + y * 0.05, 0.8, 0.6); // Blue/Cyan
        }

        // 17. SEASHELL
        else if (type === "seashell") {
            const spirals = 2; // Number of turns
            const t = u * Math.PI * 2 * spirals;
            const radius = v * 5; // Tube radius

            // Logarithmic spiral base
            const size = Math.exp(t * 0.15);

            x = size * Math.cos(t);
            y = size * Math.sin(t); // Rising
            z = (Math.random() - 0.5) * radius * (size * 0.2); // Scattering for volume

            tempColor.setHSL(0.05 + u * 0.1, 0.8, 0.5); // Orange/Yellow
        }

        // 18. CROSS
        else if (type === "cross") {
            const size = 15;
            const thickness = 4;

            // Decide horizontal or vertical bar based on u
            if (u < 0.5) {
                // Horizontal bar (X-axis)
                x = (Math.random() - 0.5) * size * 2;
                y = (Math.random() - 0.5) * thickness;
                z = (Math.random() - 0.5) * thickness;
            } else if (u < 0.75) {
                // Vertical bar (Y-axis)
                x = (Math.random() - 0.5) * thickness;
                y = (Math.random() - 0.5) * size * 2;
                z = (Math.random() - 0.5) * thickness;
            } else {
                // Depth bar (Z-axis)
                x = (Math.random() - 0.5) * thickness;
                y = (Math.random() - 0.5) * thickness;
                z = (Math.random() - 0.5) * size * 2;
            }

            tempColor.setHSL(0.0, 1, 0.5); // Red
        }

        // 19. MUSHROOM
        else if (type === "mushroom") {
            if (i < PARTICLE_COUNT * 0.4) {
                // Stem (Cylinder)
                const h = 15;
                const r = 3;
                y = (Math.random() - 0.5) * h - h / 4;
                const theta = Math.random() * Math.PI * 2;
                x = r * Math.cos(theta);
                z = r * Math.sin(theta);
                tempColor.setHSL(0.1, 0.4, 0.7); // Beige
            } else {
                // Cap (Semi-sphere)
                const r = 12;
                const phi = Math.random() * Math.PI / 2; // Top half
                const theta = Math.random() * Math.PI * 2;

                x = r * Math.sin(phi) * Math.cos(theta);
                z = r * Math.sin(phi) * Math.sin(theta);
                y = r * Math.cos(phi) + 5; // Lifted up

                tempColor.setHSL(0.0, 0.8, 0.5); // Red Cap
            }
        }

        // 20. KLEIN BOTTLE
        else if (type === "klein") {
            const t = u * Math.PI * 2;
            const s = v * Math.PI * 2;
            const r = 4 + 2 * Math.cos(t);

            if (t < Math.PI) {
                x = 6 * Math.cos(t) * (1 + Math.sin(t)) + r * Math.cos(t) * Math.cos(s);
                y = 16 * Math.sin(t) + r * Math.sin(t) * Math.cos(s);
                z = r * Math.sin(s);
            } else {
                x = 6 * Math.cos(t) * (1 + Math.sin(t)) + r * Math.cos(s + Math.PI);
                y = 16 * Math.sin(t);
                z = r * Math.sin(s);
            }
            x *= 0.5; y *= 0.5; z *= 0.5; // Scale down

            tempColor.setHSL(0.5, 1, 0.5); // Cyan/Blue
        }

        // --- SET E SHAPES (MYSTICAL) ---

        // 80. FLUXRING (Set P) - done

        // --- SET Q SHAPES (QUANTUM) ---
        else if (type === "quantafield") {
            const size = 20;
            x = (Math.random() - 0.5) * 2 * size;
            y = (Math.random() - 0.5) * 2 * size;
            z = (Math.random() - 0.5) * 2 * size;
            // Probability density function visual
            const prob = Math.exp(-(x * x + y * y + z * z) / 200);
            if (Math.random() > prob) { x = 0; y = 0; z = 0; }
            tempColor.setHSL(0.8, 1, 0.5);
        }
        else if (type === "stringvibe") {
            const t = u * Math.PI * 4;
            x = t * 2 - 12; // stretch
            y = 5 * Math.sin(t * 3 + v * 10);
            z = (Math.random() - 0.5) * 2;
            tempColor.setHSL(0.5, 1, 0.6);
        }
        else if (type === "superpos") {
            // 2 spheres in superposition
            const r = 10;
            const p = getSpherePoint(u, v, r);
            if (i % 2 === 0) { x = p.x - 5; y = p.y; z = p.z; tempColor.setHSL(0.6, 1, 0.5); }
            else { x = p.x + 5; y = p.y; z = p.z; tempColor.setHSL(0.8, 1, 0.5); }
        }
        else if (type === "entangle") {
            const t = u * Math.PI * 2;
            const r = 10;
            if (i < PARTICLE_COUNT / 2) {
                x = r * Math.cos(t) - 10; y = r * Math.sin(t); z = 0;
            } else {
                x = r * Math.cos(t) + 10; y = -r * Math.sin(t); z = 0; // Opposite spin
            }
            tempColor.setHSL(0.9, 1, 0.7);
        }
        else if (type === "probcloud") {
            // Gaussian puff
            const std = 8;
            const randn = () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
            x = randn() * std;
            y = randn() * std;
            z = randn() * std;
            tempColor.setHSL(0.75, 0.8, 0.8);
        }

        // --- SET R SHAPES (RETRO) ---
        else if (type === "pixelbit") {
            const s = 15;
            x = Math.floor((Math.random() - 0.5) * 2 * s / 2) * 2;
            y = Math.floor((Math.random() - 0.5) * 2 * s / 2) * 2;
            z = Math.floor((Math.random() - 0.5) * 2 * s / 2) * 2;
            if (Math.abs(x) > 10 || Math.abs(y) > 10) { x = 0; y = 0; z = 0; } // just small bit
            tempColor.setHSL(0.35, 1, 0.6); // Green
        }
        else if (type === "voxelstar") {
            // Blocky star
            const s = 4; // grid size
            const r = 20;
            const p = getSpherePoint(u, v, r);
            x = Math.round(p.x / s) * s;
            y = Math.round(p.y / s) * s;
            z = Math.round(p.z / s) * s;
            // Filter for star arms
            if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 15) {
                // ok
            } else {
                x = 0; y = 0; z = 0;
            }
            tempColor.setHSL(0.1, 1, 0.5);
        }
        else if (type === "invader") {
            // 2D Invader shape
            const grid = [
                "  x     x  ",
                "   x   x   ",
                "  xxxxxxx  ",
                " xx xxx xx ",
                "xxxxxxxxxxx",
                "x xxxxxxx x",
                "x x     x x",
                "   xx xx   "
            ];
            const row = Math.floor(v * 8);
            const col = Math.floor(u * 11);
            if (grid[row] && grid[row][col] === 'x') {
                x = (col - 5) * 3;
                y = (4 - row) * 3;
                z = 0;
            } else {
                x = 0; y = 0; z = 0;
            }
            tempColor.setHSL(0.0, 1, 0.5);
        }
        else if (type === "pacwaka") {
            const r = 15;
            const t = u * Math.PI * 2;
            const mouth = 0.2 * Math.PI; // open
            if (t > mouth && t < 2 * Math.PI - mouth) {
                x = r * Math.cos(t) * v; // Disc
                y = r * Math.sin(t) * v;
                z = (Math.random() - 0.5) * 2;
            } else {
            }
            tempColor.setHSL(0.15, 1, 0.5);
        } else if (type === "tetral") {
            // L-Block
            const s = 5;
            const segment = Math.floor(u * 4); // 4 blocks
            // 3 vertical, 1 horizontal
            let bx = 0, by = 0;
            if (segment < 3) { bx = 0; by = segment * s; }
            else { bx = s; by = 0; }

            x = bx + (Math.random() - 0.5) * s;
            y = by + (Math.random() - 0.5) * s - 5;
            z = (Math.random() - 0.5) * s;
            tempColor.setHSL(0.08, 1, 0.6);
        }

        // --- SET S SHAPES (SPIRAL) ---
        else if (type === "helixdna") {
            const t = u * Math.PI * 8;
            const r = 10;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = (v - 0.5) * 40;
            // Double
            if (i % 2 === 0) { x *= -1; z *= -1; } // Flip 180 deg
            tempColor.setHSL(0.3, 1, 0.5);
        }
        else if (type === "spiralo") {
            const t = u * Math.PI * 10;
            const r = t * 0.5;
            x = r * Math.cos(t);
            y = r * Math.sin(t);
            z = 0;
            tempColor.setHSL(0.05, 1, 0.5);
        }
        else if (type === "tornadox") {
            const h = 30;
            y = (v - 0.5) * h * 2; // -30 to 30
            const r = 5 + (y + 30) * 0.5; // wider at top
            const t = u * Math.PI * 10;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            tempColor.setHSL(0.2, 0.5, 0.7);
        }
        else if (type === "nautilus") {
            const t = u * Math.PI * 6;
            const r = Math.exp(0.15 * t);
            x = r * Math.cos(t);
            y = r * Math.sin(t);
            z = (Math.random() - 0.5) * r * 0.5;
            tempColor.setHSL(0.1, 0.8, 0.6);
        }
        else if (type === "vortex") {
            const t = u * Math.PI * 8;
            const r = 30 * v;
            // Sinkhole: deeper as r gets smaller
            y = -2000 / (r * r + 10);
            if (y < -30) y = -30;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            tempColor.setHSL(0.6, 0.5, 0.3);
        }

        // --- SET T SHAPES (TERRAIN) ---
        else if (type === "mountain") {
            const r = v * 20;
            const ang = u * Math.PI * 2;
            x = r * Math.cos(ang);
            z = r * Math.sin(ang);
            y = 20 - r; // Peak
            // Noise
            y += (Math.random() - 0.5) * 5;
            tempColor.setHSL(0.08, 0.6, 0.4);
        }
        else if (type === "canyon") {
            x = (u - 0.5) * 40;
            z = (v - 0.5) * 40;
            y = (Math.random() - 0.5) * 5;
            // Canyon slit
            if (Math.abs(x) < 5) y -= 20;
            tempColor.setHSL(0.07, 0.5, 0.5);
        }
        else if (type === "plateau") {
            const r = v * 20;
            const ang = u * Math.PI * 2;
            x = r * Math.cos(ang);
            z = r * Math.sin(ang);
            if (r < 10) y = 10; else y = 10 - (r - 10) * 2;
            tempColor.setHSL(0.1, 0.6, 0.4);
        }
        else if (type === "dune") {
            x = (u - 0.5) * 40;
            z = (v - 0.5) * 40;
            y = Math.sin(x * 0.2 + z * 0.1) * 5;
            // Sharp crest
            y = Math.abs(y);
            tempColor.setHSL(0.12, 0.7, 0.6);
        }
        else if (type === "volcano") {
            const r = v * 25;
            const ang = u * Math.PI * 2;
            x = r * Math.cos(ang);
            z = r * Math.sin(ang);
            y = 15 - r * 0.5;
            // Crater
            if (r < 5) y = 10 - (5 - r);
            tempColor.setHSL(0.0, 0.8, 0.4);
        }

        // --- SET U SHAPES (MARINE) ---
        else if (type === "jellydome") {
            const r = 15;
            const t = u * Math.PI * 2;
            const phi = v * Math.PI / 2; // Hemisphere
            x = r * Math.sin(phi) * Math.cos(t);
            z = r * Math.sin(phi) * Math.sin(t);
            y = r * Math.cos(phi);
            // Tentacles?
            if (Math.random() > 0.8) y -= Math.random() * 20;
            tempColor.setHSL(0.5, 0.8, 0.7);
        }
        else if (type === "coraltree") {
            // Fractal-ish branches?
            // Simple branching randomly
            const branch = Math.floor(Math.random() * 5);
            const h = (v - 0.5) * 40;
            if (branch === 0) { x = 0; z = 0; y = h; }
            else {
                const ang = branch * Math.PI * 2 / 5;
                const rad = Math.abs(h * 0.5);
                x = rad * Math.cos(ang);
                z = rad * Math.sin(ang);
                y = h;
            }
            tempColor.setHSL(0.9, 1, 0.6);
        }
        else if (type === "starfish") {
            const r = v * 20;
            const arms = 5;
            const ang = u * Math.PI * 2;
            const star = 1 + 0.5 * Math.cos(ang * arms);
            x = r * star * Math.cos(ang);
            z = r * star * Math.sin(ang);
            y = (Math.cos(r) * 2); // wavy
            tempColor.setHSL(0.05, 1, 0.6);
        }
        else if (type === "shellspiral") {
            // Conch
            const t = u * Math.PI * 10;
            const r = t * 0.3;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = t * 1;
            tempColor.setHSL(0.1, 0.5, 0.8);
        }
        else if (type === "finwave") {
            x = (u - 0.5) * 20;
            z = 0;
            y = Math.sin(x * 0.2) * 10 * v;
            tempColor.setHSL(0.6, 0.8, 0.6);
        }

        // --- SET V SHAPES (VOLCANIC) ---
        else if (type === "lavaflow") {
            x = (u - 0.5) * 30;
            z = (v - 0.5) * 30;
            y = Math.sin(x * 0.1 + z * 0.1 + performance.now() * 0.001) * 5; // Animate??
            tempColor.setHSL(0.05, 1, 0.5);
        }
        else if (type === "magmaorb") {
            const r = 15;
            const p = getSpherePoint(u, v, r);
            x = p.x; y = p.y; z = p.z;
            // Crack
            if (Math.sin(x * 0.5) * Math.sin(y * 0.5) > 0.5) {
                tempColor.setHSL(0.15, 1, 0.7); // Glow
            } else {
                tempColor.setHSL(0.0, 0, 0.2); // Rock
            }
        }
        else if (type === "ashpuff") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            const noise = Math.random() * 5;
            x = p.x + noise; y = p.y + noise; z = p.z + noise;
            tempColor.setHSL(0, 0, 0.4);
        }
        else if (type === "pyroclast") {
            const r = v * 30; // Explosion outward
            const ang = u * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            x = r * Math.sin(phi) * Math.cos(ang);
            y = r * Math.sin(phi) * Math.sin(ang);
            z = r * Math.cos(phi);
            tempColor.setHSL(0.05, 1, 0.5);
        }
        else if (type === "ember") {
            x = (Math.random() - 0.5) * 40;
            y = (Math.random() - 0.5) * 40;
            z = (Math.random() - 0.5) * 40;
            tempColor.setHSL(0.1, 1, 0.6);
        }

        // --- SET W SHAPES (WEATHER) ---
        else if (type === "thunder") {
            // Zigzag line
            const h = (v - 0.5) * 40;
            x = Math.sin(h * 0.5) * 5; // rough zig
            if (Math.random() > 0.5) x += 5;
            z = 0; y = h;
            tempColor.setHSL(0.16, 1, 0.9);
        }
        else if (type === "rainsheet") {
            x = (Math.random() - 0.5) * 40;
            z = (Math.random() - 0.5) * 40;
            y = (Math.random() - 0.5) * 40;
            // Stretch Y
            y *= 2;
            tempColor.setHSL(0.6, 0.8, 0.7);
        }
        else if (type === "snowflake") {
            const r = v * 15;
            const arms = 6;
            const ang = u * Math.PI * 2;
            // Hex symmetry
            let mod = Math.floor(ang / (Math.PI * 2 / 6)) * (Math.PI * 2 / 6);
            const localAng = ang - mod;
            // Branch
            x = r * Math.cos(ang);
            z = r * Math.sin(ang);
            y = 0;
            tempColor.setHSL(0.55, 1, 0.9);
        }
        else if (type === "cloud") {
            // Blobs
            const k = Math.floor(i / 100);
            const cx = Math.sin(k) * 20;
            const cy = Math.cos(k) * 5 + 10;
            const cz = Math.cos(k * 1.5) * 10;
            const r = 5;
            const p = getSpherePoint(u, v, r);
            x = cx + p.x; y = cy + p.y; z = cz + p.z;
            tempColor.setHSL(0, 0, 0.9);
        }
        else if (type === "hail") {
            x = (Math.random() - 0.5) * 30;
            y = (Math.random() - 0.5) * 30;
            z = (Math.random() - 0.5) * 30;
            tempColor.setHSL(0.5, 0.2, 0.9);
        }

        // --- SET X SHAPES (XENO) ---
        else if (type === "alienpod") {
            const r = 15;
            const p = getSpherePoint(u, v, r);
            y = p.y * 1.5; // Elongate
            x = p.x; z = p.z;
            tempColor.setHSL(0.35, 1, 0.6);
        }
        else if (type === "bioship") {
            // Organic asymmetry
            const r = 20;
            const p = getSpherePoint(u, v, r);
            x = p.x * 2; // Flat wide
            y = p.y * 0.5;
            z = p.z;
            tempColor.setHSL(0.8, 1, 0.6);
        }
        else if (type === "xenospine") {
            const h = (v - 0.5) * 40;
            x = Math.sin(h * 0.3) * 5;
            z = Math.cos(h * 0.3) * 5;
            y = h;
            // Vertebrae discs
            if (Math.abs(h % 5) < 1) {
                const t = u * Math.PI * 2;
                x += 4 * Math.cos(t);
                z += 4 * Math.sin(t);
            }
            tempColor.setHSL(0.3, 1, 0.5);
        }
        else if (type === "hivenode") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            // Hex grid
            if ((Math.floor(p.x) + Math.floor(p.y) + Math.floor(p.z)) % 3 === 0) {
                x = p.x; y = p.y; z = p.z;
            } else {
                x = 0; y = 0; z = 0;
            }
            tempColor.setHSL(0.15, 1, 0.5);
        }
        else if (type === "plasma") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            const noise = Math.sin(p.x * 0.5 + performance.now() * 0.001);
            x = p.x * (1 + noise * 0.2);
            y = p.y * (1 + noise * 0.2);
            z = p.z * (1 + noise * 0.2);
            tempColor.setHSL(0.85, 1, 0.6);
        }

        // --- SET Y SHAPES (DUAL) ---
        else if (type === "dualorb") {
            const r = 8;
            if (i < PARTICLE_COUNT / 2) {
                const p = getSpherePoint(u, v, r);
                x = p.x - 10; y = p.y; z = p.z;
                tempColor.setHSL(0, 0, 0.1); // Black
            } else {
                const p = getSpherePoint(u, v, r);
                x = p.x + 10; y = p.y; z = p.z;
                tempColor.setHSL(0, 0, 1); // White
            }
        }
        else if (type === "balance") {
            // Beam
            const l = (u - 0.5) * 40;
            x = l; y = 0; z = 0;
            // Trays
            if (Math.abs(x) > 18) {
                const t = v * Math.PI * 2;
                x += 5 * Math.cos(t);
                z += 5 * Math.sin(t);
            }
            tempColor.setHSL(0, 0, 0.5);
        }
        else if (type === "taijitu") {
            const r = 15;
            const t = u * Math.PI * 2;
            const rad = v * r;
            x = rad * Math.cos(t);
            z = rad * Math.sin(t);
            y = 0;
            // S-curve cut
            if (x > Math.sin(z * 0.5) * 5) {
                tempColor.setHSL(0, 0, 1);
            } else {
                tempColor.setHSL(0, 0, 0.1);
            }
        }
        else if (type === "mirror") {
            x = (u - 0.5) * 30;
            y = (v - 0.5) * 30;
            z = 0; // Plane
            if (i >= PARTICLE_COUNT / 2) z = 10; // Parallel plane
            tempColor.setHSL(0.6, 0.5, 0.8);
        }
        else if (type === "twinflame") {
            const h = v * 30;
            const ang = u * Math.PI * 2;
            const r = (1 - v) * 5;
            x = r * Math.cos(ang) - 5;
            z = r * Math.sin(ang);
            y = h - 15;
            if (i >= PARTICLE_COUNT / 2) {
                x += 10;
                tempColor.setHSL(0.6, 1, 0.6); // Blue fire
            } else {
                tempColor.setHSL(0.05, 1, 0.6); // Orange fire
            }
        }

        // --- SET Z SHAPES (ZENITH) ---
        else if (type === "omega") {
            const t = u * Math.PI; // Arch
            const r = 15;
            x = r * Math.cos(t);
            y = r * Math.sin(t);
            z = (v - 0.5) * 5;
            tempColor.setHSL(0.15, 1, 0.5);
        }
        else if (type === "singular") {
            // Dense point
            const r = 2; // Tiny
            const p = getSpherePoint(u, v, r);
            x = p.x; y = p.y; z = p.z;
            tempColor.setHSL(0, 0, 1); // Bright
        }
        else if (type === "alpha") {
            // Pyramid cap
            // Square base to point
            const h = 20;
            y = (v - 0.5) * h;
            const r = (1 - v) * 15; // Taper to top
            const sides = 4;
            const ang = Math.floor(u * 4) * Math.PI / 2;
            x = r * Math.cos(ang);
            z = r * Math.sin(ang);
            tempColor.setHSL(0.1, 1, 0.6);
        }
        else if (type === "final") {
            // Mandala
            const r = v * 20;
            const ang = u * Math.PI * 2;
            // Complex symmetry
            const mod = Math.sin(ang * 8) * Math.cos(r * 0.5);
            x = r * Math.cos(ang);
            z = r * Math.sin(ang);
            y = mod * 5;
            tempColor.setHSL(i / PARTICLE_COUNT, 1, 0.5); // Rainbow
        }
        else if (type === "zero") {
            // Empty ring
            const t = u * Math.PI * 2;
            const r = 20;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = (Math.random() - 0.5) * 2;
            tempColor.setHSL(0, 0, 0.5);
        }
        // 21. KNOTRIX (Trefoil Knot)
        else if (type === "knotrix") {
            const t = u * Math.PI * 4; // 2 loops
            const r = 10;
            x = Math.sin(t) + 2 * Math.sin(2 * t);
            y = Math.cos(t) - 2 * Math.cos(2 * t);
            z = -Math.sin(3 * t);

            // Scale up
            x *= 4; y *= 4; z *= 4;

            // Add volume
            x += (Math.random() - 0.5) * 2;
            y += (Math.random() - 0.5) * 2;
            z += (Math.random() - 0.5) * 2;

            tempColor.setHSL(0.1 + u * 0.2, 1, 0.5); // Gold/Orange
        }

        // 22. HELIXOR (Twisted Circular Helix / Toroidal Helix)
        else if (type === "helixor") {
            const R = 15; // Major radius
            const r = 5;  // Minor radius
            const turns = 10;
            const t = u * Math.PI * 2;

            x = (R + r * Math.cos(t * turns)) * Math.cos(t);
            y = (R + r * Math.cos(t * turns)) * Math.sin(t);
            z = r * Math.sin(t * turns);

            tempColor.setHSL(0.8 + u * 0.2, 1, 0.6); // Pink/Magenta
        }

        // 23. SPIRAVA (Flowing Spiral Mass)
        else if (type === "spirava") {
            const t = u * 20; // Length
            const r = t * 0.8; // Radius grows
            const angle = t * 2;

            x = r * Math.cos(angle);
            z = r * Math.sin(angle);
            y = (Math.random() - 0.5) * 10; // Vertical scatter (flow)

            // Add "flow" noise
            x += (Math.random() - 0.5) * 2;
            z += (Math.random() - 0.5) * 2;

            tempColor.setHSL(0.5 + u * 0.5, 0.8, 0.5); // Cyan to Purple
        }

        // 24. STEPLON (Layered Pyramid Core)
        else if (type === "steplon") {
            const baseSize = 25;
            const levels = 5;
            // Snapping y to levels
            const level = Math.floor(Math.random() * levels);
            y = (level / levels) * 20 - 10;

            const currentSize = baseSize * (1 - level / levels);
            x = (Math.random() - 0.5) * currentSize * 2;
            z = (Math.random() - 0.5) * currentSize * 2;

            tempColor.setHSL(0.3, 1, 0.5 - level * 0.05); // Green shades
        }

        // 25. CELLORB (Clustered Organic Sphere)
        else if (type === "cellorb") {
            // Multiple centers
            const centers = [
                { x: 10, y: 0, z: 0 },
                { x: -10, y: 0, z: 0 },
                { x: 0, y: 10, z: 0 },
                { x: 0, y: -10, z: 0 },
                { x: 0, y: 0, z: 10 },
                { x: 0, y: 0, z: -10 },
                { x: 0, y: 0, z: 0 }
            ];
            const c = centers[Math.floor(Math.random() * centers.length)];

            const p = getSpherePoint(Math.random(), Math.random(), 6);
            x = c.x + p.x;
            y = c.y + p.y;
            z = c.z + p.z;

            tempColor.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6); // Cool colors
        }

        // --- SET F SHAPES (ETHEREAL) ---

        // 26. PETALUX (Four-leaf loop structure)
        else if (type === "petalux") {
            const t = u * Math.PI * 2;
            const k = 2; // 4 leaves
            const r = 20 * Math.cos(k * t);

            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = (v - 0.5) * 10; // Height extrusion

            tempColor.setHSL(0.9, 1, 0.6); // Pinkish Red
        }

        // 27. DUALIS (Mirrored twin waves)
        else if (type === "dualis") {
            const width = 25;
            x = (u - 0.5) * width;

            // Two streams
            const offset = (v < 0.5) ? 8 : -8;
            z = offset + (Math.random() - 0.5) * 2;

            y = Math.sin(x * 0.4) * 6;

            // Mirror logic for color/phase could go here
            if (offset > 0) tempColor.setHSL(0.6, 1, 0.5); // Blue
            else tempColor.setHSL(0.0, 1, 0.5); // Red
        }

        // 28. QUADRAFOLD (Four-chamber bloom)
        else if (type === "quadrafold") {
            const t = u * Math.PI * 2;
            const p = v * Math.PI;

            // Shape modulation
            const mod = 15 + 8 * Math.sin(2 * t) * Math.sin(2 * p);

            x = mod * Math.sin(p) * Math.cos(t);
            y = mod * Math.cos(p);
            z = mod * Math.sin(p) * Math.sin(t);

            tempColor.setHSL(0.15, 1, 0.6); // Gold/Yellow
        }

        // 29. SPIKRON (Crystalline spike orb)
        else if (type === "spikron") {
            const p = getSpherePoint(u, v, 1);

            // Spikes
            const spikes = Math.pow(Math.sin(u * Math.PI * 8) * Math.sin(v * Math.PI * 8), 6) * 15;
            const r = 10 + spikes;

            x = p.x * r;
            y = p.y * r;
            z = p.z * r;

            tempColor.setHSL(0.5, 0.5, 0.8 + spikes * 0.02); // White/Blueish
        }

        // 30. TRION LOOP (Triangular void ring)
        else if (type === "trion") {
            const R = 15;
            const r = 5;
            const t = u * Math.PI * 2; // Main ring
            const p = v * Math.PI * 2; // Cross section

            // Triangle shape modification for cross section
            const tri = 1 + 0.3 * Math.cos(3 * p);
            const rMod = r * tri;

            x = (R + rMod * Math.cos(p)) * Math.cos(t);
            z = (R + rMod * Math.cos(p)) * Math.sin(t);
            y = rMod * Math.sin(p);

            // Twist
            const twist = 2;
            y = rMod * Math.sin(p + t * twist); /* varying y with t for twist */
            // Logic correction for true twist along torus is complex,
            // simple approximation:
            x = (R + rMod * Math.cos(p + t * twist)) * Math.cos(t);
            z = (R + rMod * Math.cos(p + t * twist)) * Math.sin(t);

            tempColor.setHSL(0.35, 1, 0.5); // Green
        }

        // --- SET G SHAPES (STRUCTURAL) ---

        // 31. HOLLOWX (Perforated shell sphere)
        else if (type === "hollowx") {
            // Sphere
            const p = getSpherePoint(u, v, 15);
            // Grid Subtraction (perforations)
            // If sin(x) * sin(y) * sin(z) > threshold, keep, else discard (scale to 0)
            const freq = 0.5;
            const val = Math.sin(p.x * freq) * Math.sin(p.y * freq) * Math.sin(p.z * freq);

            if (val > 0) {
                x = p.x; y = p.y; z = p.z;
                tempColor.setHSL(0.1, 1, 0.5); // Orange
            } else {
                // Hide or push to center
                x = 0; y = 0; z = 0;
                tempColor.setHSL(0, 0, 0);
            }
        }

        // 32. TWIRLON (Twin spiral hooks)
        else if (type === "twirlon") {
            const t = u * Math.PI * 4; // Length
            const r = t * 1.5;
            const branch = (i % 2 === 0) ? 1 : -1;

            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = branch * Math.pow(t, 1.5); // Hooking up/down

            // Thickness
            x += (Math.random() - 0.5) * 2;
            z += (Math.random() - 0.5) * 2;
            y += (Math.random() - 0.5) * 2;

            tempColor.setHSL(0.6 + branch * 0.1, 0.8, 0.6); // Blue/Purple
        }

        // 33. VOIDSPHERE (Large hollow lattice orb)
        else if (type === "voidsphere") {
            // Just a very large sparse sphere
            // To make it "lattice" looking, we can quantize positions
            const r = 25;
            const p = getSpherePoint(u, v, r);

            // Quantize
            const q = 4;
            x = Math.round(p.x / q) * q;
            y = Math.round(p.y / q) * q;
            z = Math.round(p.z / q) * q;

            tempColor.setHSL(0.0, 0.0, 0.8); // White
        }

        // 34. HEXABLOOM (Faceted growth core)
        else if (type === "hexabloom") {
            // Hexagonal prism-ish structures
            const layers = 6;
            const l = Math.floor(v * layers);
            const radius = (l + 1) * 4;
            const segment = Math.PI / 3;
            // Snapping angle to hex
            const angRaw = u * Math.PI * 2;
            const ang = Math.round(angRaw / segment) * segment;

            x = radius * Math.cos(ang);
            z = radius * Math.sin(ang);
            y = (l - layers / 2) * 5;

            // Add noise
            x += (Math.random() - 0.5) * 2;
            z += (Math.random() - 0.5) * 2;

            tempColor.setHSL(l / layers, 1, 0.5); // Rainbow layers
        }

        // 35. FRAMEX (Skeletal diamond frame)
        else if (type === "framex") {
            const size = 18;
            // Octahedron edges: |x|+|y|+|z| = const is surface. Edges are where one coord is 0? No.
            // Edges of octahedron: connect vertices (L,0,0) to (0,L,0) etc.
            // Let's just draw lines between 6 vertices. 12 edges.
            const edges = [
                // Top pyramid
                [1, 0, 0, 0, 1, 0], [-1, 0, 0, 0, 1, 0], [0, 0, 1, 0, 1, 0], [0, 0, -1, 0, 1, 0],
                // Bottom pyramid
                [1, 0, 0, 0, -1, 0], [-1, 0, 0, 0, -1, 0], [0, 0, 1, 0, -1, 0], [0, 0, -1, 0, -1, 0],
                // Equator
                [1, 0, 0, 0, 0, 1], [0, 0, 1, -1, 0, 0], [-1, 0, 0, 0, 0, -1], [0, 0, -1, 1, 0, 0]
            ];

            const edgeIdx = Math.floor(Math.random() * 12);
            const edge = edges[edgeIdx];
            const t = Math.random(); // Position along edge

            // Lerp
            x = (edge[0] + (edge[3] - edge[0]) * t) * size;
            y = (edge[1] + (edge[4] - edge[1]) * t) * size;
            z = (edge[2] + (edge[5] - edge[2]) * t) * size;

            // Thickness
            x += (Math.random() - 0.5) * 1.5;
            y += (Math.random() - 0.5) * 1.5;
            z += (Math.random() - 0.5) * 1.5;

            tempColor.setHSL(0.15, 1, 0.6); // Gold
        }

        // --- SET H SHAPES (POLYGONAL) ---

        // 36. POLYNEST (Honeycomb shell)
        else if (type === "polynest") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            // Hex grid approx -> sin(x)+sin(y)+sin(z)
            const hex = Math.cos(p.x * 0.5) + Math.cos(p.y * 0.5) + Math.cos(p.z * 0.5);
            if (hex > 0) {
                x = p.x; y = p.y; z = p.z;
            } else {
                x = 0; y = 0; z = 0;
            }
            tempColor.setHSL(0.1, 1, 0.5); // Orange
        }

        // 37. ICOSHARD (Sharp-edge poly core)
        else if (type === "icoshard") {
            const r = 15;
            const p = getSpherePoint(u, v, r);

            // Spikes
            const spike = Math.pow(Math.abs(Math.sin(u * 20) * Math.cos(v * 20)), 0.2);
            const rMod = r * (0.5 + spike);

            x = p.x / r * rMod;
            y = p.y / r * rMod;
            z = p.z / r * rMod;

            tempColor.setHSL(0.0, 1, 0.4); // Red
        }

        // 38. ORBITALIS (Floating ring mass)
        else if (type === "orbitalis") {
            const rings = 5;
            const ringIdx = Math.floor(Math.random() * rings);
            const r = 10 + ringIdx * 4;
            const t = u * Math.PI * 2;

            // Random orientation per ring (simulated by using ringIdx)
            if (ringIdx % 3 === 0) {
                x = r * Math.cos(t); z = r * Math.sin(t); y = (Math.random() - 0.5);
            } else if (ringIdx % 3 === 1) {
                x = r * Math.cos(t); y = r * Math.sin(t); z = (Math.random() - 0.5);
            } else {
                y = r * Math.cos(t); z = r * Math.sin(t); x = (Math.random() - 0.5);
            }
            tempColor.setHSL(0.55, 1, 0.5); // Cyan
        }

        // 39. STARLOCK (Embedded star poly)
        else if (type === "starlock") {
            const points = 6;
            const t = u * Math.PI * 2 * points;
            const star = 1 + 0.5 * Math.cos(t);
            const r = 15 * star * Math.sin(v * Math.PI);

            x = r * Math.cos(u * Math.PI * 2);
            z = r * Math.sin(u * Math.PI * 2);
            y = 15 * Math.cos(v * Math.PI);

            tempColor.setHSL(0.2, 1, 0.6); // Yellowish
        }

        // 40. WEBCORE (Stretched lattice star)
        else if (type === "webcore") {
            // Sphere points pulled to centers
            const p = getSpherePoint(u, v, 20);
            const pull = Math.random() > 0.8 ? 0.2 : 1; // 20% points pulled in
            x = p.x * pull;
            y = p.y * pull;
            z = p.z * pull;

            // Connect lines visually by density
            tempColor.setHSL(0.8, 1, 0.5); // Magenta
        }

        // --- SET I SHAPES (GEOMETRIC) ---

        // 41. FLEXAHEDRON (Elastic frame cube)
        else if (type === "flexahedron") {
            const size = 15;
            // Cube edges but curved inwards
            const edge = Math.floor(Math.random() * 12); // 12 edges
            // Simplified: Just cube surface with curvature
            x = (Math.random() - 0.5) * 2 * size;
            y = (Math.random() - 0.5) * 2 * size;
            z = (Math.random() - 0.5) * 2 * size;

            // Push to surface
            const maxAxis = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
            if (maxAxis === Math.abs(x)) x = size * Math.sign(x);
            else if (maxAxis === Math.abs(y)) y = size * Math.sign(y);
            else z = size * Math.sign(z);

            // Curvature: pull centers in
            const dist = Math.sqrt(x * x + y * y + z * z);
            const factor = 1 - 0.3 * Math.sin(dist * 0.1);
            x *= factor; y *= factor; z *= factor;

            tempColor.setHSL(0.6, 1, 0.5); // Blue
        }

        // 42. TRINOVA (Triangular star solid)
        else if (type === "trinova") {
            // 3 points
            const angle = (Math.floor(u * 3) / 3) * Math.PI * 2;
            const r = 15 * v; // Fill

            // Mix with sphere for volume
            x = r * Math.cos(angle) + (Math.random() - 0.5) * 5;
            y = r * Math.sin(angle) + (Math.random() - 0.5) * 5;
            z = (Math.random() - 0.5) * 10;

            tempColor.setHSL(0.1, 1, 0.5); // Orange/Red
        }

        // 43. GRIDON (Soft cage cube)
        else if (type === "gridon") {
            const size = 20;
            const step = 4;
            x = (Math.round((Math.random() - 0.5) * size / step) * step) * 2;
            y = (Math.round((Math.random() - 0.5) * size / step) * step) * 2;
            z = (Math.round((Math.random() - 0.5) * size / step) * step) * 2;
            tempColor.setHSL(0.3, 1, 0.5); // Green
        }

        // 44. VOIDCUBE (Cut-out geometry block)
        else if (type === "voidcube") {
            const size = 20;
            x = (Math.random() - 0.5) * 2 * size;
            y = (Math.random() - 0.5) * 2 * size;
            z = (Math.random() - 0.5) * 2 * size;

            // Menger-ish: remove middle thirds
            const inMidX = Math.abs(x) < size / 3;
            const inMidY = Math.abs(y) < size / 3;
            const inMidZ = Math.abs(z) < size / 3;

            if ((inMidX && inMidY) || (inMidX && inMidZ) || (inMidY && inMidZ)) {
                x = 0; y = 0; z = 0; // Hide
            }
            tempColor.setHSL(0.0, 0, 0.7); // Grey
        }

        // 45. PERFORON (Rounded hole poly)
        else if (type === "perforon") {
            const r = 20;
            const p = getSpherePoint(u, v, r);

            // Big holes
            const hole = Math.sin(p.x * 0.3) * Math.sin(p.y * 0.3) * Math.sin(p.z * 0.3);
            if (hole > 0.5) {
                x = 0; y = 0; z = 0;
            } else {
                x = p.x; y = p.y; z = p.z;
            }
            tempColor.setHSL(0.7, 1, 0.5); // Violet
        }

        // --- SET J SHAPES (ORGANIC) ---

        // 46. NETSPHERE (Organic mesh orb)
        else if (type === "netsphere") {
            const r = 20;
            const p = getSpherePoint(u, v, r);

            // Wobbly
            const wobble = Math.sin(p.x * 0.5) * 2;
            x = p.x + wobble;
            y = p.y + wobble;
            z = p.z + wobble;

            tempColor.setHSL(0.4, 1, 0.5); // Green/Cyan
        }

        // 47. GYRONEX (Rotating core shell)
        else if (type === "gyronex") {
            const t = u * 40;
            const r = t * 0.5;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = (v - 0.5) * 20;

            tempColor.setHSL(u, 1, 0.5); // Rainbow
        }

        // 48. PULSEORB (Layered energy sphere)
        else if (type === "pulseorb") {
            // Concentric shells
            const layers = 5;
            const layer = Math.floor(i % layers);
            const r = 5 + layer * 5;
            const p = getSpherePoint(u, v, r);
            x = p.x; y = p.y; z = p.z;
            tempColor.setHSL(0.6 + layer * 0.1, 1, 0.5);
        }

        // 49. CAGEON (Hollow rounded cube)
        else if (type === "cageon") {
            const s = 15;
            const n = 4; // Superellipsoid power
            const theta = u * Math.PI * 2 - Math.PI;
            const phi = v * Math.PI - Math.PI / 2;

            const c1 = Math.cos(theta);
            const s1 = Math.sin(theta);
            const c2 = Math.cos(phi);
            const s2 = Math.sin(phi);

            // Aux sign function
            const sgn = (w) => w > 0 ? 1 : (w < 0 ? -1 : 0);
            const pow = (w, p) => Math.pow(Math.abs(w), p);

            x = s * sgn(c2) * pow(c2, 2 / n) * sgn(c1) * pow(c1, 2 / n);
            y = s * sgn(c2) * pow(c2, 2 / n) * sgn(s1) * pow(s1, 2 / n);
            z = s * sgn(s2) * pow(s2, 2 / n);

            tempColor.setHSL(0.9, 1, 0.5); // Pink
        }

        // 50. MONOCORE (Single-face poly)
        else if (type === "monocore") {
            // Tetrahedron points
            const p = [
                { x: 15, y: 15, z: 15 },
                { x: -15, y: -15, z: 15 },
                { x: -15, y: 15, z: -15 },
                { x: 15, y: -15, z: -15 }
            ];
            // Randomly pick 2 and interpolate
            const p1 = p[Math.floor(Math.random() * 4)];
            const p2 = p[Math.floor(Math.random() * 4)];
            const t = Math.random();

            x = p1.x + (p2.x - p1.x) * t;
            y = p1.y + (p2.y - p1.y) * t;
            z = p1.z + (p2.z - p1.z) * t;

            tempColor.setHSL(0.5, 0, 1.0); // White
        }

        // --- SET K SHAPES (FOLDED/STELLAR) --- 51-55
        else if (type === "starvault") {
            // Folded stellar shell
            const r = 20;
            const p = getSpherePoint(u, v, r);
            // Fold inwards based on angle modulation
            const fold = 1 - 0.5 * Math.abs(Math.sin(p.x * 0.2) * Math.sin(p.z * 0.2));
            x = p.x * fold; y = p.y * fold; z = p.z * fold;
            tempColor.setHSL(0.1, 1, 0.6);
        }
        else if (type === "facetron") {
            // Change to OCTAHEDRON (Diamond shape)
            const s = 15;
            // Random point in octahedron volume? |x|+|y|+|z| <= s
            // Surface: |x|+|y|+|z| = s
            // Generate random barycentric coords for faces
            // 8 faces.
            const face = Math.floor(Math.random() * 8);
            // Base vectors
            const v1 = { x: s, y: 0, z: 0 };
            const v2 = { x: 0, y: s, z: 0 };
            const v3 = { x: 0, y: 0, z: s };
            // Signs based on face bits
            const sx = (face & 1) ? -1 : 1;
            const sy = (face & 2) ? -1 : 1;
            const sz = (face & 4) ? -1 : 1;

            // Random point on triangle
            let r1 = Math.random();
            let r2 = Math.random();
            if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }

            x = sx * (v1.x + (v2.x - v1.x) * r1 + (v3.x - v1.x) * r2);
            y = sy * (v1.y + (v2.y - v1.y) * r1 + (v3.y - v1.y) * r2);
            z = sz * (v1.z + (v2.z - v1.z) * r1 + (v3.z - v1.z) * r2);

            tempColor.setHSL(0.6, 0.5, 0.5);
        }
        else if (type === "softtess") {
            // Smooth cellular orb
            const r = 20;
            const p = getSpherePoint(u, v, r);
            x = p.x + Math.sin(p.y) * 2;
            y = p.y + Math.sin(p.z) * 2;
            z = p.z + Math.sin(p.x) * 2;
            tempColor.setHSL(0.05, 1, 0.7);
        }
        else if (type === "scalesphere") {
            // Layered scale cluster
            const r = 18;
            const p = getSpherePoint(u, v, r);
            const scale = 1 + 0.2 * Math.sin(v * 50);
            x = p.x * scale; y = p.y * scale; z = p.z * scale;
            tempColor.setHSL(0.3, 0.8, 0.4);
        }
        else if (type === "trifold") {
            // Triple-blade junction
            const ang = u * Math.PI * 2;
            const rad = v * 20;
            const blade = Math.floor(ang / (Math.PI * 2 / 3));
            const bladeAng = blade * (Math.PI * 2 / 3);
            // Flat blades
            x = rad * Math.cos(bladeAng) + (Math.random() - 0.5) * 2;
            z = rad * Math.sin(bladeAng) + (Math.random() - 0.5) * 2;
            y = (Math.random() - 0.5) * 20;
            tempColor.setHSL(0.9, 1, 0.5);
        }

        // --- SET L SHAPES (COMPOSITE/NODAL) --- 56-60
        else if (type === "celllock") {
            const size = 15;
            // Segmented shell node
            // Box with separated faces
            x = (Math.random() - 0.5) * 2 * size;
            y = (Math.random() - 0.5) * 2 * size;
            z = (Math.random() - 0.5) * 2 * size;
            // Push to face
            const max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
            if (max < size * 0.8) { x = x / max * size * 0.8; y = y / max * size * 0.8; z = z / max * size * 0.8; } // hollow
            // Make gaps (lock)
            if (Math.abs(x) < 2 || Math.abs(y) < 2 || Math.abs(z) < 2) { x *= 0.5; y *= 0.5; z *= 0.5; }
            tempColor.setHSL(0.4, 1, 0.5);
        }
        else if (type === "polymelt") {
            // Change to CONE
            const h = 20;
            const r = 10 * (v); // radius increases with height? No, cone base
            // Cone: y from -10 to 10. Radius at y is linearly related.
            y = (u - 0.5) * h * 2;
            const currentR = 10 * (1 - (y + h) / (h * 2)); // Base at bottom
            const t = v * Math.PI * 2;
            x = currentR * Math.cos(t);
            z = currentR * Math.sin(t);
            tempColor.setHSL(0.15, 1, 0.5);
        }
        else if (type === "netcube") {
            // Wrapped lattice block
            const s = 15;
            // Lines on cube surface
            x = (Math.random() > 0.5 ? 1 : -1) * s;
            y = (Math.random() - 0.5) * 2 * s;
            z = (Math.random() - 0.5) * 2 * s;
            // Randomly swap axis to cover all faces
            const roll = Math.random();
            if (roll < 0.33) { let t = x; x = y; y = t; }
            else if (roll < 0.66) { let t = x; x = z; z = t; }

            // Grid pattern
            if (Math.round(y) % 4 === 0 || Math.round(z) % 4 === 0) {
                // keep
            } else {
                x = 0; y = 0; z = 0;
            }
            tempColor.setHSL(0.5, 0.5, 0.8);
        }
        else if (type === "ripplecore") {
            const r = 18;
            const p = getSpherePoint(u, v, r);
            const rip = Math.sin(Math.sqrt(p.x * p.x + p.z * p.z));
            x = p.x; z = p.z; y = p.y + rip * 2;
            tempColor.setHSL(0.6, 0.8, 0.6);
        }
        else if (type === "glyphorb") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            // Etch symbols (random noise removal)
            if (Math.sin(p.x * 2) * Math.cos(p.y * 2) > 0.8) { x = 0; y = 0; z = 0; }
            else { x = p.x; y = p.y; z = p.z; }
            tempColor.setHSL(0.1, 0, 0.9);
        }

        // --- SET M SHAPES (CRYSTAL/MESH) --- 61-65
        else if (type === "geoweave") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            // Triangulated mesh look?
            if ((Math.floor(u * 20) + Math.floor(v * 20)) % 2 === 0) { x = p.x; y = p.y; z = p.z; }
            else { x = p.x * 0.9; y = p.y * 0.9; z = p.z * 0.9; }
            tempColor.setHSL(0.3, 1, 0.4);
        }
        else if (type === "shardbloom") {
            // Change to FLAT STAR (Galaxy)
            // Flat in X-Z plane
            const r = v * 20;
            const arms = 5;
            const ang = u * Math.PI * 2;
            // Modulate radius for star shape
            const star = 1 + 0.4 * Math.sin(ang * arms);
            x = r * star * Math.cos(ang);
            z = r * star * Math.sin(ang);
            y = (Math.random() - 0.5) * 2; // Flat
            tempColor.setHSL(0.8, 0.5, 0.7);
        }
        else if (type === "flownode") {
            const t = u * 40;
            x = t * Math.cos(t) * 0.5;
            z = t * Math.sin(t) * 0.5;
            y = Math.sin(t * 0.5) * 10;
            tempColor.setHSL(0.5, 1, 0.5);
        }
        else if (type === "voidmesh") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            // Smooth noise holes
            if (Math.sin(p.x * 0.4) + Math.sin(p.y * 0.4) + Math.sin(p.z * 0.4) > 1) { x = 0; y = 0; z = 0; }
            else { x = p.x; y = p.y; z = p.z; }
            tempColor.setHSL(0.05, 1, 0.6);
        }
        else if (type === "crystalon") {
            // Sharp facet poly orb
            const r = 18;
            const p = getSpherePoint(u, v, r);
            // Facet
            const f = 5;
            x = Math.floor(p.x / f) * f;
            y = Math.floor(p.y / f) * f;
            z = Math.floor(p.z / f) * f;
            tempColor.setHSL(0.55, 0.8, 0.8);
        }

        // --- SET N SHAPES (MECH/TECH) --- 66-70
        else if (type === "locksphere") {
            // Rings
            const r = 15;
            const t = u * Math.PI * 2;
            // 3 rings orthogonal
            const axes = Math.floor(v * 3);
            if (axes === 0) { x = r * Math.cos(t); y = r * Math.sin(t); z = (Math.random() - 0.5) * 2; }
            else if (axes === 1) { x = r * Math.cos(t); z = r * Math.sin(t); y = (Math.random() - 0.5) * 2; }
            else { y = r * Math.cos(t); z = r * Math.sin(t); x = (Math.random() - 0.5) * 2; }
            tempColor.setHSL(0.0, 0, 0.5);
        }
        else if (type === "hexapod") {
            // Change to JACK (Points at ends of axes)
            const axis = Math.floor(Math.random() * 3); // 0=x, 1=y, 2=z
            const dir = Math.random() > 0.5 ? 1 : -1;
            const len = 15 + Math.random() * 5; // Stick length

            // Core sphere logic or stick logic?
            // Let's make it 6 distinct spheres at ends
            const part = Math.floor(Math.random() * 7); // 0=center, 1-6=tips
            if (part === 0) {
                // Center
                const p = getSpherePoint(u, v, 5);
                x = p.x; y = p.y; z = p.z;
            } else {
                const tipR = 4;
                const p = getSpherePoint(u, v, tipR);
                if (part === 1) { x = p.x + 15; y = p.y; z = p.z; }
                else if (part === 2) { x = p.x - 15; y = p.y; z = p.z; }
                else if (part === 3) { x = p.x; y = p.y + 15; z = p.z; }
                else if (part === 4) { x = p.x; y = p.y - 15; z = p.z; }
                else if (part === 5) { x = p.x; y = p.y; z = p.z + 15; }
                else { x = p.x; y = p.y; z = p.z - 15; }
            }
            tempColor.setHSL(0.1, 1, 0.5);
        }
        else if (type === "orbitron") {
            // Encased rotating ring
            // Sphere + Ring
            if (i % 2 === 0) {
                const p = getSpherePoint(u, v, 10);
                x = p.x; y = p.y; z = p.z;
            } else {
                const t = u * Math.PI * 2;
                x = 22 * Math.cos(t);
                z = 22 * Math.sin(t);
                y = (Math.random() - 0.5) * 2;
            }
            tempColor.setHSL(0.6, 1, 0.5);
        }
        else if (type === "starplate") {
            // Angular prism
            const r = 20;
            const ang = u * Math.PI * 2;
            const corners = 5;
            const d = r * (1 + 0.5 * Math.cos(corners * ang));
            x = d * Math.cos(ang);
            z = d * Math.sin(ang);
            y = (v - 0.5) * 5;
            tempColor.setHSL(0.2, 1, 0.6);
        }
        else if (type === "brainyx") {
            // Neural loop
            const r = 15;
            const p = getSpherePoint(u, v, r);
            const noise = Math.sin(p.x * 0.5) * Math.cos(p.y * 0.5) * Math.sin(p.z * 0.5);
            if (noise > 0 && noise < 0.2) { x = p.x; y = p.y; z = p.z; }
            else { x = p.x * 0.5; y = p.y * 0.5; z = p.z * 0.5; }
            tempColor.setHSL(0.85, 1, 0.6);
        }

        // --- SET O SHAPES (SPACE/WIRE) --- 71-75
        else if (type === "aeroshell") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            if (p.y > 5) { x = p.x; z = p.z; y = p.y * 1.5; } // elongate top
            else { x = p.x; z = p.z; y = p.y; }
            tempColor.setHSL(0.55, 1, 0.8);
        }
        else if (type === "wirestar") {
            // Change to SPIRAL
            const t = u * Math.PI * 4; // 2 turns
            const r = t * 2;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = (v - 0.5) * 5;
            tempColor.setHSL(0.1, 1, 0.5);
        }
        else if (type === "triloop") {
            const t = u * Math.PI * 2;
            const r = 10 + 5 * Math.cos(3 * t);
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = 5 * Math.sin(3 * t);
            tempColor.setHSL(0.3, 1, 0.6);
        }
        else if (type === "warpgrid") {
            const s = 20;
            x = (u - 0.5) * 2 * s;
            z = (v - 0.5) * 2 * s;
            y = Math.sin(Math.sqrt(x * x + z * z) * 0.5) * 5;
            tempColor.setHSL(0.7, 1, 0.5);
        }
        else if (type === "nanobloom") {
            const r = 15;
            const p = getSpherePoint(u, v, r);
            const micro = Math.sin(p.x * 2) * Math.sin(p.y * 2) * Math.sin(p.z * 2);
            x = p.x * (1 + micro * 0.2); y = p.y * (1 + micro * 0.2); z = p.z * (1 + micro * 0.2);
            tempColor.setHSL(0.9, 0.5, 0.5);
        }

        // --- SET P SHAPES (ADVANCED) --- 76-80
        else if (type === "crescenta") {
            const t = u * Math.PI * 1.5; // incomplete circle
            const r = 15;
            x = r * Math.cos(t);
            y = r * Math.sin(t);
            z = (v - 0.5) * 5;
            tempColor.setHSL(0.15, 1, 0.6);
        }
        else if (type === "solarcell") {
            // Change to BOX GRID (Flat Plane)
            const s = 30;
            x = (u - 0.5) * s;
            z = (v - 0.5) * s;
            y = 0;
            // Grid gaps
            if (Math.abs(x % 5) < 0.5 || Math.abs(z % 5) < 0.5) { y = -1000; } // hide
            tempColor.setHSL(0.1, 1, 0.5);
        }
        else if (type === "geopetal") {
            const r = 20;
            const p = getSpherePoint(u, v, r);
            const petals = 5;
            const mod = 1 + 0.2 * Math.sin(u * Math.PI * petals);
            x = p.x * mod; y = p.y * mod; z = p.z * mod;
            tempColor.setHSL(0.8, 0.8, 0.6);
        }
        else if (type === "linkcore") {
            const t = u * Math.PI * 2;
            const r = 10;
            // Chain link 1
            if (i < PARTICLE_COUNT / 2) {
                x = r * Math.cos(t) - 5;
                y = r * Math.sin(t);
                z = (v - 0.5) * 2;
            } else {
                // Chain link 2 (rotated 90 deg and shifted)
                x = (v - 0.5) * 2 + 5;
                y = r * Math.cos(t);
                z = r * Math.sin(t);
            }
            tempColor.setHSL(0.6, 0, 0.8);
        }
        else if (type === "fluxring") {
            // Flow band
            const t = u * Math.PI * 2;
            const r = 15;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
            y = Math.sin(t * 5 + v * 10) * 3;
            tempColor.setHSL(0.5, 1, 0.6);
        }


        targetPositions[i * 3] = x;
        targetPositions[i * 3 + 1] = y;
        targetPositions[i * 3 + 2] = z;

        colors[i * 3] = tempColor.r;
        colors[i * 3 + 1] = tempColor.g;
        colors[i * 3 + 2] = tempColor.b;
    }

    geometry.attributes.color.needsUpdate = true;
}

// Initialize with Sphere
generateShape("sphere");

/**
 * STATE & ANIMATION
 */
let currentShape = "sphere";
let particleScale = 1.0; // Controlled by two-hand distance
let isManualRotation = false; // Flag for manual rotation mode

// Initialize state
// Initialize state
window.currentSet = 'A';

/* SIDEBAR LOGIC */
const SETS_DATA = {
    'A': { name: 'Default', color: '#00ff00', shapes: ['Heart', 'Saturn', 'Flower', 'Fireworks', 'Sphere'] },
    'B': { name: 'Advanced', color: '#ffaa00', shapes: ['Helix', 'Spiral', 'Cube', 'Star', 'Torus'] },
    'C': { name: 'Expert', color: '#ff00ff', shapes: ['Pyramid', 'Hourglass', 'Atom', 'Tornado', 'Ribbon'] },
    'D': { name: 'Cosmic', color: '#00ffff', shapes: ['Wave', 'Seashell', 'Cross', 'Mushroom', 'Klein'] },
    'E': { name: 'Mystical', color: '#aa00ff', shapes: ['Knotrix', 'Helixor', 'Spirava', 'Steplon', 'Cellorb'] },
    'F': { name: 'Ethereal', color: '#00ff88', shapes: ['Petalux', 'Dualis', 'QuadraFold', 'Spikron', 'TrionLoop'] },
    'G': { name: 'Structural', color: '#ffcc00', shapes: ['Hollowx', 'Twirlon', 'VoidSphere', 'HexaBloom', 'FrameX'] },
    'H': { name: 'Polygonal', color: '#ff00aa', shapes: ['PolyNest', 'Icoshard', 'Orbitalis', 'Starlock', 'WebCore'] },
    'I': { name: 'Geometric', color: '#00aaff', shapes: ['Flexahedron', 'TriNova', 'Gridon', 'VoidCube', 'Perforon'] },
    'J': { name: 'Organic', color: '#ffffff', shapes: ['NetSphere', 'Gyronex', 'PulseOrb', 'Cageon', 'MonoCore'] },
    'K': { name: 'Folded', color: '#ffdddd', shapes: ['StarVault', 'Facetron', 'SoftTess', 'ScaleSphere', 'TriFold'] },
    'L': { name: 'Composite', color: '#ddffdd', shapes: ['CellLock', 'PolyMelt', 'NetCube', 'RippleCore', 'GlyphOrb'] },
    'M': { name: 'Crystal', color: '#ddddff', shapes: ['GeoWeave', 'ShardBloom', 'FlowNode', 'VoidMesh', 'Crystalon'] },
    'N': { name: 'Mech', color: '#ffffdd', shapes: ['LockSphere', 'HexaPod', 'Orbitron', 'StarPlate', 'Brainyx'] },
    'O': { name: 'Space', color: '#ddffff', shapes: ['AeroShell', 'WireStar', 'TriLoop', 'WarpGrid', 'NanoBloom'] },
    'P': { name: 'Advanced II', color: '#ffddff', shapes: ['Crescenta', 'SolarCell', 'GeoPetal', 'LinkCore', 'FluxRing'] },
    'Q': { name: 'Quantum', color: '#bf00ff', shapes: ['QuantaField', 'StringVibe', 'SuperPos', 'Entangle', 'ProbCloud'] },
    'R': { name: 'Retro', color: '#00ff44', shapes: ['PixelBit', 'VoxelStar', 'Invader', 'PacWaka', 'TetraL'] },
    'S': { name: 'Spiral', color: '#ffaa00', shapes: ['HelixDNA', 'Spiralo', 'Tornadox', 'Nautilus', 'Vortex'] },
    'T': { name: 'Terrain', color: '#8b4513', shapes: ['Mountain', 'Canyon', 'Plateau', 'Dune', 'Volcano'] },
    'U': { name: 'Marine', color: '#00ced1', shapes: ['JellyDome', 'CoralTree', 'StarFish', 'ShellSpiral', 'FinWave'] },
    'V': { name: 'Volcanic', color: '#ff4500', shapes: ['LavaFlow', 'MagmaOrb', 'AshPuff', 'PyroClast', 'Ember'] },
    'W': { name: 'Weather', color: '#b0c4de', shapes: ['Thunder', 'RainSheet', 'SnowFlake', 'Cloud', 'Hail'] },
    'X': { name: 'Xeno', color: '#39ff14', shapes: ['AlienPod', 'BioShip', 'XenoSpine', 'HiveNode', 'Plasma'] },
    'Y': { name: 'Dual', color: '#aaaaaa', shapes: ['DualOrb', 'Balance', 'Taijitu', 'Mirror', 'TwinFlame'] },
    'Z': { name: 'Zenith', color: '#ffd700', shapes: ['Omega', 'Singular', 'Alpha', 'Final', 'Zero'] }
};

function populateSidebar() {
    const list = document.getElementById('set-list');
    list.innerHTML = '';

    // Create Category Container
    const category = document.createElement('div');
    category.className = 'category-container'; // Default collapsed

    // Category Title (Button)
    const catTitle = document.createElement('div');
    catTitle.className = 'category-title';
    catTitle.innerHTML = `<span>Core Collection</span> <span class="category-arrow">▼</span>`;

    // Toggle Logic
    catTitle.onclick = () => {
        category.classList.toggle('open');
    };
    category.appendChild(catTitle);

    // Content Container
    const catContent = document.createElement('div');
    catContent.className = 'category-content';

    for (const [key, data] of Object.entries(SETS_DATA)) {
        const item = document.createElement('div');
        item.className = 'set-item';
        item.dataset.set = key;
        item.onclick = () => {
            window.currentSet = key;
            toggleSet(true); // pass flag to skip next toggle logic but update UI
        };

        const header = document.createElement('div');
        header.className = 'set-header';
        header.innerHTML = `<span>Set ${key} - ${data.name}</span> <span class="set-indicator-dot" style="background:${data.color}"></span>`;

        const tags = document.createElement('div');
        tags.className = 'shape-tags';
        tags.innerText = data.shapes.join(', ');

        item.appendChild(header);
        item.appendChild(tags);
        catContent.appendChild(item);
    }

    category.appendChild(catContent);
    list.appendChild(category);
}

function updateSidebarActive() {
    const items = document.querySelectorAll('.set-item');
    items.forEach(item => {
        if (item.dataset.set === window.currentSet) item.classList.add('active');
        else item.classList.remove('active');
    });
}

// Search Logic
// Search Logic
document.getElementById('search-shapes').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const categories = document.querySelectorAll('.category-container');

    categories.forEach(cat => {
        const items = cat.querySelectorAll('.set-item');
        let hasVisibleItem = false;

        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            if (text.includes(val)) {
                item.style.display = 'flex';
                hasVisibleItem = true;
            } else {
                item.style.display = 'none';
            }
        });

        // If filtering (val not empty), control expansion
        if (val !== '') {
            if (hasVisibleItem) {
                cat.classList.add('open');
            } else {
                // Optional: Close if no match, or leave as is. 
                // Let's keep it open if it was already open, or just ensure expanding on match.
                // Actually, if I search for "Z", I want "A" to close if it doesn't match? 
                // No, just valid matches should be visible.
                // If hasMatches -> Open.
                // If !hasMatches -> Close? Or maybe just let the items be hidden.
                // If I search "Box", Set A might have none. hiding items is enough, 
                // but closing category tidies it up.
                cat.classList.remove('open');
            }
        }
    });
});

// Toggle Sidebar
document.getElementById('sidebar-toggle').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent ensuring document click doesn't immediately close it
    document.getElementById('sidebar').classList.toggle('active');
});

// Close Sidebar on Click Outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');

    if (sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

// Init Sidebar
populateSidebar();

let handX = 0; // -1 to 1 (Raw)
let handY = 0; // -1 to 1 (Raw)
let smoothHandX = 0; // Smoothed
let smoothHandY = 0; // Smoothed

let prevHandX = 0;
let prevHandY = 0;

function animate() {
    requestAnimationFrame(animate);

    const posAttr = geometry.attributes.position;
    const positionsArr = posAttr.array;

    // Smooth rotation based on hand X position
    if (!isManualRotation) {
        particles.rotation.y += 0.002 + handX * 0.02;
        particles.rotation.x += handY * 0.02;

        // Sync smooth/prev vars to current to avoid jumps when switching modes
        smoothHandX = handX;
        smoothHandY = handY;
        prevHandX = handX;
        prevHandY = handY;
    } else {
        // Manual Delta Rotation

        // Apply smoothing (Lerp) to inputs
        const lerpFactor = 0.1;
        smoothHandX += (handX - smoothHandX) * lerpFactor;
        smoothHandY += (handY - smoothHandY) * lerpFactor;

        const deltaX = smoothHandX - prevHandX;
        const deltaY = smoothHandY - prevHandY;

        // Sensitivity factor (increase slightly to compensate for smoothing lag perception)
        const sensitive = 3.5;

        particles.rotation.y += deltaX * sensitive;
        particles.rotation.x += deltaY * sensitive;

        prevHandX = smoothHandX;
        prevHandY = smoothHandY;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;

        // Current position
        let cx = positionsArr[idx];
        let cy = positionsArr[idx + 1];
        let cz = positionsArr[idx + 2];

        // Target position based on shape
        let tx = targetPositions[idx];
        let ty = targetPositions[idx + 1];
        let tz = targetPositions[idx + 2];

        // Apply Two-Hand Scaling
        tx *= particleScale;
        ty *= particleScale;
        tz *= particleScale;


        // Lerp (Linear Interpolation) for smooth transition
        const lerpSpeed = 0.05;

        positionsArr[idx] += (tx - cx) * lerpSpeed;
        positionsArr[idx + 1] += (ty - cy) * lerpSpeed;
        positionsArr[idx + 2] += (tz - cz) * lerpSpeed;
    }

    posAttr.needsUpdate = true;
    renderer.render(scene, camera);
}
// animate(); // Moved to end of file to prevent TDZ errors

/**
 * MEDIAPIPE HAND TRACKING
 */
const videoElement = document.getElementById("input-video");
const loadingElement = document.getElementById("loading");

// Hand Logic Helper
// Hand Logic Helper
function countFingers(landmarks) {
    let count = 0;
    const thumbOpen = Math.abs(landmarks[4].x - landmarks[17].x) > 0.15;
    const indexOpen = landmarks[8].y < landmarks[6].y;
    const middleOpen = landmarks[12].y < landmarks[10].y;
    const ringOpen = landmarks[16].y < landmarks[14].y;
    const pinkyOpen = landmarks[20].y < landmarks[18].y;

    if (thumbOpen) count++;
    if (indexOpen) count++;
    if (middleOpen) count++;
    if (ringOpen) count++;
    if (pinkyOpen) count++;

    return { count, thumbOpen, indexOpen, middleOpen, ringOpen, pinkyOpen };
}

function isThumbsUp(landmarks) {
    // Check if Index, Middle, Ring, Pinky are curled
    // Tips should be below PIPs
    const isIndexCurled = landmarks[8].y > landmarks[6].y;
    const isMiddleCurled = landmarks[12].y > landmarks[10].y;
    const isRingCurled = landmarks[16].y > landmarks[14].y;
    const isPinkyCurled = landmarks[20].y > landmarks[18].y;

    // Check if Thumb is extended drastically upwards
    // Thumb Tip (4) must be significantly higher (lower Y) than Index MCP (5)
    // and also higher than Thumb IP (3)
    const isThumbUp = landmarks[4].y < landmarks[3].y && landmarks[4].y < landmarks[5].y - 0.02;

    return isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled && isThumbUp;
}

function isFist(landmarks) {
    // Check if fingers are curled. 
    // Thumb is NOT up (unlike ThumbsUp)

    // Safety: If it looks like a Thumbs Up, it is NOT a fist.
    // This prevents the Manual Rotation mode from blocking the Set Switch gesture
    // if the finger counting acts up (e.g. thumb not detected as "open" by X-dist).
    if (isThumbsUp(landmarks)) return false;

    // Additional Safety: Even if isThumbsUp is false (maybe index not curled enough),
    // if the thumb is clearly pointing UP, it is NOT a fist.
    // Thumb Tip (4) significantly higher (lower Y) than Thumb IP (3)
    // 0.05 is a heuristic margin.
    if (landmarks[4].y < landmarks[3].y - 0.05) return false;

    const fs = countFingers(landmarks);
    // If count is 0, it's likely a fist.
    return fs.count === 0;
}



function onResults(results) {
    loadingElement.style.opacity = 0; // Hide loading

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {
        const landmarks = results.multiHandLandmarks[0];

        // 1. Determine Manual Rotation Mode FIRST
        isManualRotation = false; // Reset frame flag
        let primaryHand = landmarks;

        if (results.multiHandLandmarks.length === 2) {
            const lm1 = results.multiHandLandmarks[0];
            const lm2 = results.multiHandLandmarks[1];
            if (isFist(lm1)) {
                isManualRotation = true;
                primaryHand = lm2;
            } else if (isFist(lm2)) {
                isManualRotation = true;
                primaryHand = lm1;
            }
        } else if (results.multiHandLandmarks.length === 1) {
            if (isFist(landmarks)) isManualRotation = true;
        }

        // 2. Map Hand Position (Use primary hand)
        handX = (primaryHand[9].x - 0.5) * -2;
        handY = (primaryHand[9].y - 0.5) * -2;

        // 3. Two-Hand Zoom Logic
        // Only run zoom if NOT in manual rotation mode
        if (!isManualRotation && results.multiHandLandmarks.length === 2) {
            const hand1 = results.multiHandLandmarks[0];
            const hand2 = results.multiHandLandmarks[1];

            // Calculate distance between wrists (landmark 0)
            const dx = hand1[0].x - hand2[0].x;
            const dy = hand1[0].y - hand2[0].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Define Thresholds
            const baseDist = 0.2;

            if (dist < baseDist) {
                particleScale = 1.0;
            } else {
                particleScale = 1.0 + (dist - baseDist) * 1.5;
            }
        } else if (!isManualRotation) {
            // Smooth reset if not 2 hands (and not manual rotating)
            // If manual rotating, we LOCK zoom (do nothing to particleScale)
            particleScale = particleScale * 0.9 + 1.0 * 0.1;
        }

        // 3. Gesture Logic (Set Switching & Shapes)
        // Only run gesture logic on the FIRST hand if it's the only one, or maybe dominant?
        // Let's stick to hand1 for gestures for simplicity, but gestures might get tricky with zoom.
        // Let's assume gestures work on the first detected hand.

        const fingerState = countFingers(landmarks);

        // Check for Thumbs Up (Strict) OR Thumb Only (Loose) checks
        // We consider it "Thumbs Up" if:
        // A) Strict isThumbsUp() returns true
        // B) Finger count is 1 AND that 1 is the Thumb (using generic check)

        // 2 Hand Logic for Gestures
        // "if my both hand are on frame ... i have to show the same guesture with my both hands"

        // 4. Gesture Logic Setup
        let matchedFingers = 0;
        let gestureMatched = false;
        // isManualRotation already set above

        if (results.multiHandLandmarks.length === 2) {
            const lm1 = results.multiHandLandmarks[0];
            const lm2 = results.multiHandLandmarks[1];

            // Check for Fist for Rotation Control
            if (isManualRotation) {
                // Do nothing for gestures if rotating
            } else {
                // Normal 2-Hand Gesture Logic (Sync)
                const fs1 = countFingers(lm1);
                const fs2 = countFingers(lm2);

                const thumbsUp1 = isThumbsUp(lm1);
                const thumbsUp2 = isThumbsUp(lm2);

                if (thumbsUp1 && thumbsUp2) {
                    // Removed setSwitchTrigger = true;
                } else if (fs1.count === fs2.count) {
                    matchedFingers = fs1.count;
                    gestureMatched = true;
                    if (matchedFingers === 1 && (fs1.thumbOpen || fs2.thumbOpen)) {
                        gestureMatched = false;
                    }
                }
            }
        } else if (results.multiHandLandmarks.length === 1) {
            // Single Hand Logic
            const fs = fingerState;
            const thumbsUp = isThumbsUp(landmarks);

            if (thumbsUp) {
                // Removed setSwitchTrigger = true;
            } else {
                matchedFingers = fs.count;
                gestureMatched = true;
            }
        }

        // Removed if (false) { // Disabled Trigger ... } else { ... } block
        if (results.multiHandLandmarks.length === 1 || results.multiHandLandmarks.length === 2) {
            window.thumbsUpHeldSince = null;
            window.setToggleLock = false;

            if (gestureMatched) {
                const fingers = matchedFingers;
                let newShape = currentShape;

                if (!window.currentSet) window.currentSet = 'A';

                if (window.currentSet === 'A') {
                    if (fingers === 1) newShape = "heart";
                    else if (fingers === 2) newShape = "saturn";
                    else if (fingers === 3) newShape = "flower";
                    else if (fingers === 4) newShape = "fireworks";
                    else if (fingers === 5) newShape = "sphere";
                } else if (window.currentSet === 'B') {
                    if (fingers === 1) newShape = "helix";
                    else if (fingers === 2) newShape = "spiral";
                    else if (fingers === 3) newShape = "cube";
                    else if (fingers === 4) newShape = "star";
                    else if (fingers === 5) newShape = "torus";
                } else if (window.currentSet === 'C') {
                    // Set C
                    if (fingers === 1) newShape = "pyramid";
                    else if (fingers === 2) newShape = "hourglass";
                    else if (fingers === 3) newShape = "atom";
                    else if (fingers === 4) newShape = "tornado";
                    else if (fingers === 5) newShape = "ribbon";
                } else if (window.currentSet === 'D') {
                    // Set D
                    if (fingers === 1) newShape = "wave";
                    else if (fingers === 2) newShape = "seashell";
                    else if (fingers === 3) newShape = "cross";
                    else if (fingers === 4) newShape = "mushroom";
                    else if (fingers === 5) newShape = "klein";
                } else if (window.currentSet === 'E') {
                    // Set E
                    if (fingers === 1) newShape = "knotrix";
                    else if (fingers === 2) newShape = "helixor";
                    else if (fingers === 3) newShape = "spirava";
                    else if (fingers === 4) newShape = "steplon";
                    else if (fingers === 5) newShape = "cellorb";
                } else if (window.currentSet === 'F') {
                    // Set F
                    if (fingers === 1) newShape = "petalux";
                    else if (fingers === 2) newShape = "dualis";
                    else if (fingers === 3) newShape = "quadrafold";
                    else if (fingers === 4) newShape = "spikron";
                    else if (fingers === 5) newShape = "trion";
                } else if (window.currentSet === 'G') {
                    // Set G
                    if (fingers === 1) newShape = "hollowx";
                    else if (fingers === 2) newShape = "twirlon";
                    else if (fingers === 3) newShape = "voidsphere";
                    else if (fingers === 4) newShape = "hexabloom";
                    else if (fingers === 5) newShape = "framex";
                } else if (window.currentSet === 'H') {
                    // Set H
                    if (fingers === 1) newShape = "polynest";
                    else if (fingers === 2) newShape = "icoshard";
                    else if (fingers === 3) newShape = "orbitalis";
                    else if (fingers === 4) newShape = "starlock";
                    else if (fingers === 5) newShape = "webcore";
                } else if (window.currentSet === 'I') {
                    // Set I
                    if (fingers === 1) newShape = "flexahedron";
                    else if (fingers === 2) newShape = "trinova";
                    else if (fingers === 3) newShape = "gridon";
                    else if (fingers === 4) newShape = "voidcube";
                    else if (fingers === 5) newShape = "perforon";
                } else if (window.currentSet === 'J') {
                    // Set J
                    if (fingers === 1) newShape = "netsphere";
                    else if (fingers === 2) newShape = "gyronex";
                    else if (fingers === 3) newShape = "pulseorb";
                    else if (fingers === 4) newShape = "cageon";
                    else if (fingers === 5) newShape = "monocore";
                } else if (window.currentSet === 'K') {
                    // Set K
                    if (fingers === 1) newShape = "starvault";
                    else if (fingers === 2) newShape = "facetron";
                    else if (fingers === 3) newShape = "softtess";
                    else if (fingers === 4) newShape = "scalesphere";
                    else if (fingers === 5) newShape = "trifold";
                } else if (window.currentSet === 'L') {
                    // Set L
                    if (fingers === 1) newShape = "celllock";
                    else if (fingers === 2) newShape = "polymelt";
                    else if (fingers === 3) newShape = "netcube";
                    else if (fingers === 4) newShape = "ripplecore";
                    else if (fingers === 5) newShape = "glyphorb";
                } else if (window.currentSet === 'M') {
                    // Set M
                    if (fingers === 1) newShape = "geoweave";
                    else if (fingers === 2) newShape = "shardbloom";
                    else if (fingers === 3) newShape = "flownode";
                    else if (fingers === 4) newShape = "voidmesh";
                    else if (fingers === 5) newShape = "crystalon";
                } else if (window.currentSet === 'N') {
                    // Set N
                    if (fingers === 1) newShape = "locksphere";
                    else if (fingers === 2) newShape = "hexapod";
                    else if (fingers === 3) newShape = "orbitron";
                    else if (fingers === 4) newShape = "starplate";
                    else if (fingers === 5) newShape = "brainyx";
                } else if (window.currentSet === 'O') {
                    // Set O
                    if (fingers === 1) newShape = "aeroshell";
                    else if (fingers === 2) newShape = "wirestar";
                    else if (fingers === 3) newShape = "triloop";
                    else if (fingers === 4) newShape = "warpgrid";
                    else if (fingers === 5) newShape = "nanobloom";
                } else if (window.currentSet === 'P') {
                    // Set P
                    if (fingers === 1) newShape = "crescenta";
                    else if (fingers === 2) newShape = "solarcell";
                    else if (fingers === 3) newShape = "geopetal";
                    else if (fingers === 4) newShape = "linkcore";
                    else if (fingers === 5) newShape = "fluxring";
                } else if (window.currentSet === 'Q') {
                    // Set Q
                    if (fingers === 1) newShape = "quantafield";
                    else if (fingers === 2) newShape = "stringvibe";
                    else if (fingers === 3) newShape = "superpos";
                    else if (fingers === 4) newShape = "entangle";
                    else if (fingers === 5) newShape = "probcloud";
                } else if (window.currentSet === 'R') {
                    // Set R
                    if (fingers === 1) newShape = "pixelbit";
                    else if (fingers === 2) newShape = "voxelstar";
                    else if (fingers === 3) newShape = "invader";
                    else if (fingers === 4) newShape = "pacwaka";
                    else if (fingers === 5) newShape = "tetral";
                } else if (window.currentSet === 'S') {
                    // Set S
                    if (fingers === 1) newShape = "helixdna";
                    else if (fingers === 2) newShape = "spiralo";
                    else if (fingers === 3) newShape = "tornadox";
                    else if (fingers === 4) newShape = "nautilus";
                    else if (fingers === 5) newShape = "vortex";
                } else if (window.currentSet === 'T') {
                    // Set T
                    if (fingers === 1) newShape = "mountain";
                    else if (fingers === 2) newShape = "canyon";
                    else if (fingers === 3) newShape = "plateau";
                    else if (fingers === 4) newShape = "dune";
                    else if (fingers === 5) newShape = "volcano";
                } else if (window.currentSet === 'U') {
                    // Set U
                    if (fingers === 1) newShape = "jellydome";
                    else if (fingers === 2) newShape = "coraltree";
                    else if (fingers === 3) newShape = "starfish";
                    else if (fingers === 4) newShape = "shellspiral";
                    else if (fingers === 5) newShape = "finwave";
                } else if (window.currentSet === 'V') {
                    // Set V
                    if (fingers === 1) newShape = "lavaflow";
                    else if (fingers === 2) newShape = "magmaorb";
                    else if (fingers === 3) newShape = "ashpuff";
                    else if (fingers === 4) newShape = "pyroclast";
                    else if (fingers === 5) newShape = "ember";
                } else if (window.currentSet === 'W') {
                    // Set W
                    if (fingers === 1) newShape = "thunder";
                    else if (fingers === 2) newShape = "rainsheet";
                    else if (fingers === 3) newShape = "snowflake";
                    else if (fingers === 4) newShape = "cloud";
                    else if (fingers === 5) newShape = "hail";
                } else if (window.currentSet === 'X') {
                    // Set X
                    if (fingers === 1) newShape = "alienpod";
                    else if (fingers === 2) newShape = "bioship";
                    else if (fingers === 3) newShape = "xenospine";
                    else if (fingers === 4) newShape = "hivenode";
                    else if (fingers === 5) newShape = "plasma";
                } else if (window.currentSet === 'Y') {
                    // Set Y
                    if (fingers === 1) newShape = "dualorb";
                    else if (fingers === 2) newShape = "balance";
                    else if (fingers === 3) newShape = "taijitu";
                    else if (fingers === 4) newShape = "mirror";
                    else if (fingers === 5) newShape = "twinflame";
                } else {
                    // Set Z
                    if (fingers === 1) newShape = "omega";
                    else if (fingers === 2) newShape = "singular";
                    else if (fingers === 3) newShape = "alpha";
                    else if (fingers === 4) newShape = "final";
                    else if (fingers === 5) newShape = "zero";
                }

                if (newShape !== currentShape) {
                    currentShape = newShape;
                    generateShape(currentShape);
                }
            }
        }

    } else {
        // No hands detected, relax parameters
        handX *= 0.95;
        handY *= 0.95;
        particleScale = particleScale * 0.9 + 1.0 * 0.1; // Reset scale
        window.thumbsUpHeldSince = null;
    }
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

hands.onResults(onResults);

const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
});

cameraUtils.start();

// Window Resize Handler
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Expose toggleSet for UI Button
function toggleSet(skipCycle = false) {
    console.log("Toggle Set Clicked. Current:", window.currentSet);

    if (!skipCycle) {
        // Cycle A -> ... -> Z -> A
        if (!window.currentSet || window.currentSet === 'A') window.currentSet = 'B';
        else if (window.currentSet === 'B') window.currentSet = 'C';
        else if (window.currentSet === 'C') window.currentSet = 'D';
        else if (window.currentSet === 'D') window.currentSet = 'E';
        else if (window.currentSet === 'E') window.currentSet = 'F';
        else if (window.currentSet === 'F') window.currentSet = 'G';
        else if (window.currentSet === 'G') window.currentSet = 'H';
        else if (window.currentSet === 'H') window.currentSet = 'I';
        else if (window.currentSet === 'I') window.currentSet = 'J';
        else if (window.currentSet === 'J') window.currentSet = 'K';
        else if (window.currentSet === 'K') window.currentSet = 'L';
        else if (window.currentSet === 'L') window.currentSet = 'M';
        else if (window.currentSet === 'M') window.currentSet = 'N';
        else if (window.currentSet === 'N') window.currentSet = 'O';
        else if (window.currentSet === 'O') window.currentSet = 'P';
        else if (window.currentSet === 'P') window.currentSet = 'Q';
        else if (window.currentSet === 'Q') window.currentSet = 'R';
        else if (window.currentSet === 'R') window.currentSet = 'S';
        else if (window.currentSet === 'S') window.currentSet = 'T';
        else if (window.currentSet === 'T') window.currentSet = 'U';
        else if (window.currentSet === 'U') window.currentSet = 'V';
        else if (window.currentSet === 'V') window.currentSet = 'W';
        else if (window.currentSet === 'W') window.currentSet = 'X';
        else if (window.currentSet === 'X') window.currentSet = 'Y';
        else if (window.currentSet === 'Y') window.currentSet = 'Z';
        else window.currentSet = 'A';
    }
    console.log("New Set:", window.currentSet);

    if (window.setToggleLock !== undefined) {
        window.setToggleLock = true;
    }

    // Visual Feedback for Toggle
    if (material) {
        material.color.setHex(0x00ff00);
        setTimeout(() => material.color.setHex(0xffffff), 200);
    }

    // UI Update
    const uiSetA = document.getElementById('set-a');
    const uiSetB = document.getElementById('set-b');
    const uiSetC = document.getElementById('set-c');
    const uiSetD = document.getElementById('set-d');
    const uiSetE = document.getElementById('set-e');
    const uiSetF = document.getElementById('set-f');
    const uiSetG = document.getElementById('set-g');
    const uiSetH = document.getElementById('set-h');
    const uiSetI = document.getElementById('set-i');
    const uiSetJ = document.getElementById('set-j');
    const uiSetK = document.getElementById('set-k');
    const uiSetL = document.getElementById('set-l');
    const uiSetM = document.getElementById('set-m');
    const uiSetN = document.getElementById('set-n');
    const uiSetO = document.getElementById('set-o');
    const uiSetP = document.getElementById('set-p');
    const uiSetQ = document.getElementById('set-q');
    const uiSetR = document.getElementById('set-r');
    const uiSetS = document.getElementById('set-s');
    const uiSetT = document.getElementById('set-t');
    const uiSetU = document.getElementById('set-u');
    const uiSetV = document.getElementById('set-v');
    const uiSetW = document.getElementById('set-w');
    const uiSetX = document.getElementById('set-x');
    const uiSetY = document.getElementById('set-y');
    const uiSetZ = document.getElementById('set-z');
    const uiInd = document.getElementById('set-indicator');

    if (uiSetA && uiSetB && uiSetC && uiSetD && uiSetE && uiSetF && uiSetG && uiSetH && uiSetI && uiSetJ && uiSetK && uiSetL && uiSetM && uiSetN && uiSetO && uiSetP && uiSetQ && uiSetR && uiSetS && uiSetT && uiSetU && uiSetV && uiSetW && uiSetX && uiSetY && uiSetZ && uiInd) {
        // Reset all
        uiSetA.style.display = 'none'; uiSetB.style.display = 'none'; uiSetC.style.display = 'none';
        uiSetD.style.display = 'none'; uiSetE.style.display = 'none'; uiSetF.style.display = 'none';
        uiSetG.style.display = 'none'; uiSetH.style.display = 'none'; uiSetI.style.display = 'none';
        uiSetJ.style.display = 'none'; uiSetK.style.display = 'none'; uiSetL.style.display = 'none';
        uiSetM.style.display = 'none'; uiSetN.style.display = 'none'; uiSetO.style.display = 'none';
        uiSetP.style.display = 'none'; uiSetQ.style.display = 'none'; uiSetR.style.display = 'none';
        uiSetS.style.display = 'none'; uiSetT.style.display = 'none'; uiSetU.style.display = 'none';
        uiSetV.style.display = 'none'; uiSetW.style.display = 'none'; uiSetX.style.display = 'none';
        uiSetY.style.display = 'none'; uiSetZ.style.display = 'none';

        // Update active class in Sidebvar
        updateSidebarActive();

        if (window.currentSet === 'A') {
            uiSetA.style.display = 'block';
            uiInd.innerText = "SET A (Default)";
            uiInd.style.color = "#0f0";
        } else if (window.currentSet === 'B') {
            uiSetB.style.display = 'block';
            uiInd.innerText = "SET B (Advanced)";
            uiInd.style.color = "#ffaa00";
        } else if (window.currentSet === 'C') {
            uiSetC.style.display = 'block';
            uiInd.innerText = "SET C (Expert)";
            uiInd.style.color = "#ff00ff";
        } else if (window.currentSet === 'D') {
            uiSetD.style.display = 'block';
            uiInd.innerText = "SET D (Cosmic)";
            uiInd.style.color = "#00ffff";
        } else if (window.currentSet === 'E') {
            uiSetE.style.display = 'block';
            uiInd.innerText = "SET E (Mystical)";
            uiInd.style.color = "#aa00ff";
        } else if (window.currentSet === 'F') {
            uiSetF.style.display = 'block';
            uiInd.innerText = "SET F (Ethereal)";
            uiInd.style.color = "#00ff88";
        } else if (window.currentSet === 'G') {
            uiSetG.style.display = 'block';
            uiInd.innerText = "SET G (Structural)";
            uiInd.style.color = "#ffcc00";
        } else if (window.currentSet === 'H') {
            uiSetH.style.display = 'block';
            uiInd.innerText = "SET H (Polygonal)";
            uiInd.style.color = "#ff00aa";
        } else if (window.currentSet === 'I') {
            uiSetI.style.display = 'block';
            uiInd.innerText = "SET I (Geometric)";
            uiInd.style.color = "#00aaff";
        } else if (window.currentSet === 'J') {
            uiSetJ.style.display = 'block';
            uiInd.innerText = "SET J (Organic)";
            uiInd.style.color = "#ffffff";
        } else if (window.currentSet === 'K') {
            uiSetK.style.display = 'block';
            uiInd.innerText = "SET K (Folded/Stellar)";
            uiInd.style.color = "#ffdddd";
        } else if (window.currentSet === 'L') {
            uiSetL.style.display = 'block';
            uiInd.innerText = "SET L (Composite)";
            uiInd.style.color = "#ddffdd";
        } else if (window.currentSet === 'M') {
            uiSetM.style.display = 'block';
            uiInd.innerText = "SET M (Crystal)";
            uiInd.style.color = "#ddddff";
        } else if (window.currentSet === 'N') {
            uiSetN.style.display = 'block';
            uiInd.innerText = "SET N (Mech)";
            uiInd.style.color = "#ffffdd";
        } else if (window.currentSet === 'O') {
            uiSetO.style.display = 'block';
            uiInd.innerText = "SET O (Space)";
            uiInd.style.color = "#ddffff";
        } else if (window.currentSet === 'P') {
            uiSetP.style.display = 'block';
            uiInd.innerText = "SET P (Advanced)";
            uiInd.style.color = "#ffddff";
        } else if (window.currentSet === 'Q') {
            uiSetQ.style.display = 'block';
            uiInd.innerText = "SET Q (Quantum)";
            uiInd.style.color = "#bf00ff";
        } else if (window.currentSet === 'R') {
            uiSetR.style.display = 'block';
            uiInd.innerText = "SET R (Retro)";
            uiInd.style.color = "#00ff44";
        } else if (window.currentSet === 'S') {
            uiSetS.style.display = 'block';
            uiInd.innerText = "SET S (Spiral)";
            uiInd.style.color = "#ffaa00";
        } else if (window.currentSet === 'T') {
            uiSetT.style.display = 'block';
            uiInd.innerText = "SET T (Terrain)";
            uiInd.style.color = "#8b4513";
        } else if (window.currentSet === 'U') {
            uiSetU.style.display = 'block';
            uiInd.innerText = "SET U (Marine)";
            uiInd.style.color = "#00ced1";
        } else if (window.currentSet === 'V') {
            uiSetV.style.display = 'block';
            uiInd.innerText = "SET V (Volcanic)";
            uiInd.style.color = "#ff4500";
        } else if (window.currentSet === 'W') {
            uiSetW.style.display = 'block';
            uiInd.innerText = "SET W (Weather)";
            uiInd.style.color = "#b0c4de";
        } else if (window.currentSet === 'X') {
            uiSetX.style.display = 'block';
            uiInd.innerText = "SET X (Xeno)";
            uiInd.style.color = "#39ff14";
        } else if (window.currentSet === 'Y') {
            uiSetY.style.display = 'block';
            uiInd.innerText = "SET Y (Dual)";
            uiInd.style.color = "#aaaaaa";
        } else {
            uiSetZ.style.display = 'block';
            uiInd.innerText = "SET Z (Zenith)";
            uiInd.style.color = "#ffd700";
        }
    }
}
window.toggleSet = toggleSet;

const SET_CONFIG = {
    'A': { name: "SET A (Default)", color: "#00ff00", shapes: ["heart", "saturn", "flower", "fireworks", "sphere"] },
    'B': { name: "SET B (Advanced)", color: "#ffaa00", shapes: ["helix", "spiral", "cube", "star", "torus"] },
    'C': { name: "SET C (Expert)", color: "#ff00ff", shapes: ["pyramid", "hourglass", "atom", "tornado", "ribbon"] },
    'D': { name: "SET D (Cosmic)", color: "#00ffff", shapes: ["wave", "seashell", "cross", "mushroom", "klein"] },
    'E': { name: "SET E (Mystical)", color: "#aa00ff", shapes: ["knotrix", "helixor", "spirava", "steplon", "cellorb"] },
    'F': { name: "SET F (Ethereal)", color: "#00ff88", shapes: ["petalux", "dualis", "quadrafold", "spikron", "trion"] },
    'G': { name: "SET G (Structural)", color: "#ffcc00", shapes: ["hollowx", "twirlon", "voidsphere", "hexabloom", "framex"] },
    'H': { name: "SET H (Polygonal)", color: "#ff00aa", shapes: ["polynest", "icoshard", "orbitalis", "starlock", "webcore"] },
    'I': { name: "SET I (Geometric)", color: "#00aaff", shapes: ["flexahedron", "trinova", "gridon", "voidcube", "perforon"] },
    'J': { name: "SET J (Organic)", color: "#ffffff", shapes: ["netsphere", "gyronex", "pulseorb", "cageon", "monocore"] },
    'K': { name: "SET K (Folded/Stellar)", color: "#ffdddd", shapes: ["starvault", "facetron", "softtess", "scalesphere", "trifold"] },
    'L': { name: "SET L (Composite)", color: "#ddffdd", shapes: ["celllock", "polymelt", "netcube", "ripplecore", "glyphorb"] },
    'M': { name: "SET M (Crystal)", color: "#ddddff", shapes: ["geoweave", "shardbloom", "flownode", "voidmesh", "crystalon"] },
    'N': { name: "SET N (Mech)", color: "#ffffdd", shapes: ["locksphere", "hexapod", "orbitron", "starplate", "brainyx"] },
    'O': { name: "SET O (Space)", color: "#ddffff", shapes: ["aeroshell", "wirestar", "triloop", "warpgrid", "nanobloom"] },
    'P': { name: "SET P (Advanced)", color: "#ffddff", shapes: ["crescenta", "solarcell", "geopetal", "linkcore", "fluxring"] },
    'Q': { name: "SET Q (Quantum)", color: "#bf00ff", shapes: ["quantafield", "stringvibe", "superpos", "entangle", "probcloud"] },
    'R': { name: "SET R (Retro)", color: "#00ff44", shapes: ["pixelbit", "voxelstar", "invader", "pacwaka", "tetral"] },
    'S': { name: "SET S (Spiral)", color: "#ffaa00", shapes: ["helixdna", "spiralo", "tornadox", "nautilus", "vortex"] },
    'T': { name: "SET T (Terrain)", color: "#8b4513", shapes: ["mountain", "canyon", "plateau", "dune", "volcano"] },
    'U': { name: "SET U (Marine)", color: "#00ced1", shapes: ["jellydome", "coraltree", "starfish", "shellspiral", "finwave"] },
    'V': { name: "SET V (Volcanic)", color: "#ff4500", shapes: ["lavaflow", "magmaorb", "ashpuff", "pyroclast", "ember"] },
    'W': { name: "SET W (Weather)", color: "#b0c4de", shapes: ["thunder", "rainsheet", "snowflake", "cloud", "hail"] },
    'X': { name: "SET X (Xeno)", color: "#39ff14", shapes: ["alienpod", "bioship", "xenospine", "hivenode", "plasma"] },
    'Y': { name: "SET Y (Dual)", color: "#aaaaaa", shapes: ["dualorb", "balance", "taijitu", "mirror", "twinflame"] },
    'Z': { name: "SET Z (Zenith)", color: "#ffd700", shapes: ["omega", "singular", "alpha", "final", "zero"] }
};

function cycleSet(direction) {
    console.log("CycleSet called with direction:", direction);
    const sets = Object.keys(SET_CONFIG);
    let idx = sets.indexOf(window.currentSet);
    console.log("Current Set:", window.currentSet, "Index:", idx);

    // If invalid set, default to A
    if (idx === -1) idx = 0;

    // Update index
    idx += direction;

    // Wrap around
    if (idx >= sets.length) idx = 0;
    if (idx < 0) idx = sets.length - 1;

    const newSet = sets[idx];

    if (window.currentSet !== newSet) {
        window.currentSet = newSet;
        window.currentShape = 1;

        // Force First Shape
        const conf = SET_CONFIG[newSet];
        if (conf && conf.shapes && conf.shapes.length > 0) {
            const firstShape = conf.shapes[0];
            if (typeof generateShape === 'function') {
                console.log("Switching to first shape:", firstShape);
                generateShape(firstShape);
                // Update global tracking var if possible to keep sync
                try {
                    if (typeof currentShape !== 'undefined') currentShape = firstShape;
                } catch (e) { }
            }
        }

        // Update UI
        // Hide all set-*-ui elements?
        // Actually, the IDs in toggleSet were 'set-a', 'set-b'... NOT 'set-a-ui'.
        // Step 287 showed 'set-x-ui' in MY previous code, but toggleSet (Step 300) uses 'set-a', 'set-b'.
        // I must use the IDs from toggleSet: 'set-a', 'set-b', etc.

        sets.forEach(s => {
            const el = document.getElementById('set-' + s.toLowerCase());
            if (el) el.style.display = 'none';
        });

        const activeEl = document.getElementById('set-' + newSet.toLowerCase());
        if (activeEl) activeEl.style.display = 'block';

        const uiInd = document.getElementById('ui-indicator') || document.getElementById('set-indicator');
        // toggleSet uses 'set-indicator', my previous code used 'ui-indicator'.
        // Let's try both or prioritize set-indicator as per toggleSet.

        if (uiInd) {
            const conf = SET_CONFIG[newSet];
            uiInd.innerText = conf.name;
            uiInd.style.color = conf.color;
        }

        // Sidebar update if needed
        if (typeof updateSidebarActive === 'function') updateSidebarActive();
    }
}
window.cycleSet = cycleSet;

// Bind Button
// Bind Buttons
const nextBtn = document.getElementById('btn-next-set');
const prevBtn = document.getElementById('btn-prev-set');

if (nextBtn) {
    nextBtn.addEventListener('click', () => cycleSet(1));
}
if (prevBtn) {
    prevBtn.addEventListener('click', () => cycleSet(-1));
}

// Help Modal Logic
const helpBtn = document.getElementById("btn-help");
const helpModal = document.getElementById("help-modal");
const closeHelp = document.getElementById("close-help");

if (helpBtn && helpModal && closeHelp) {
    // Open
    helpBtn.addEventListener("click", () => {
        helpModal.style.display = "block";
        helpModal.style.opacity = "1"; // Ensure opacity is reset
        const content = helpModal.querySelector('.modal-content');
        if (content) content.style.opacity = "1";
    });

    // Close
    closeHelp.addEventListener("click", () => {
        helpModal.style.display = "none";
    });

    // Click Outside
    document.addEventListener("click", (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = "none";
        }
    });
}

// Camera Toggle Logic
const btnToggleCamera = document.getElementById('btn-toggle-camera');
const videoContainer = document.getElementById('video-container');

if (btnToggleCamera && videoContainer) {
    btnToggleCamera.addEventListener('click', () => {
        if (videoContainer.style.display === 'none') {
            videoContainer.style.display = 'block';
            btnToggleCamera.innerText = 'Hide Camera';
        } else {
            videoContainer.style.display = 'none';
            btnToggleCamera.innerText = 'Show Camera';
        }
    });
}

// Start Animation Loop
animate();
