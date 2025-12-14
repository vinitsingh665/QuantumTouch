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
animate();

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
        let setSwitchTrigger = false;
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
                    setSwitchTrigger = true;
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
                setSwitchTrigger = true;
            } else {
                matchedFingers = fs.count;
                gestureMatched = true;
            }
        }

        if (setSwitchTrigger) {
            if (!window.thumbsUpHeldSince) window.thumbsUpHeldSince = Date.now();
            if (Date.now() - window.thumbsUpHeldSince > 50) {
                // Toggle Sets
                if (!window.setToggleLock) {
                    // Cycle A -> B -> C -> A
                    if (!window.currentSet || window.currentSet === 'A') {
                        window.currentSet = 'B';
                    } else if (window.currentSet === 'B') {
                        window.currentSet = 'C';
                    } else {
                        window.currentSet = 'A';
                    }

                    window.setToggleLock = true;

                    // Visual Feedback for Toggle
                    material.color.setHex(0x00ff00);
                    setTimeout(() => material.color.setHex(0xffffff), 200);

                    // UI Update
                    const uiSetA = document.getElementById('set-a');
                    const uiSetB = document.getElementById('set-b');
                    const uiSetC = document.getElementById('set-c');
                    const uiInd = document.getElementById('set-indicator');

                    // Reset all
                    uiSetA.style.display = 'none';
                    uiSetB.style.display = 'none';
                    uiSetC.style.display = 'none';

                    if (window.currentSet === 'A') {
                        uiSetA.style.display = 'block';
                        uiInd.innerText = "SET A (Default)";
                        uiInd.style.color = "#0f0";
                    } else if (window.currentSet === 'B') {
                        uiSetB.style.display = 'block';
                        uiInd.innerText = "SET B (Advanced)";
                        uiInd.style.color = "#ffaa00";
                    } else {
                        uiSetC.style.display = 'block';
                        uiInd.innerText = "SET C (Expert)";
                        uiInd.style.color = "#ff00ff";
                    }
                }
            }
        } else {
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
                    } else {
                        // Set C
                        if (fingers === 1) newShape = "pyramid";
                        else if (fingers === 2) newShape = "hourglass";
                        else if (fingers === 3) newShape = "atom";
                        else if (fingers === 4) newShape = "tornado";
                        else if (fingers === 5) newShape = "ribbon";
                    }

                    if (newShape !== currentShape) {
                        currentShape = newShape;
                        generateShape(currentShape);
                    }
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
