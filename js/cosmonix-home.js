import * as THREE from 'three';

// COSMONIX 26 — normal homepage scene.
// The launch sequence, rocket models and audio stay removed; only the ambient
// planet rotation and event-moon orbits run here.

const mount = document.getElementById('cosmonix-scene');
if (!mount) throw new Error('COSMONIX: #cosmonix-scene not found.');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010305);
scene.fog = new THREE.FogExp2(0x010305, 0.001);

const camera = new THREE.PerspectiveCamera(
    window.innerWidth < 700 ? 42 : 34,
    window.innerWidth / window.innerHeight,
    0.1,
    700
);
const cameraTarget = new THREE.Vector3(2.2, 0, 0);

function getCameraPosition() {
    const width = window.innerWidth;
    if (width < 700) return new THREE.Vector3(0, 0.6, 16.5);
    if (width < 1000) return new THREE.Vector3(0, 0.6, 17.5);
    return new THREE.Vector3(0, 0.6, 18);
}

function getEarthPosition() {
    if (window.innerWidth < 700) return new THREE.Vector3(6, -0.2, 0);
    if (window.innerWidth < 1000) return new THREE.Vector3(3.3, -0.35, 0);
    return new THREE.Vector3(6, -0.2, 0);
}

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
mount.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x9bc8df, 2.8));

const keyLight = new THREE.DirectionalLight(0xd7f5ff, 6.5);
keyLight.position.set(-8, 6, 11);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x16dfff, 55, 34, 2);
rimLight.position.set(6, -2, 5);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0x438fff, 24, 22, 2);
fillLight.position.set(1, 3, 8);
scene.add(fillLight);

const starCount = window.innerWidth < 700 ? 850 : 1800;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let index = 0; index < starCount; index++) {
    const offset = index * 3;
    const radius = 38 + Math.random() * 125;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    starPositions[offset] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[offset + 1] = radius * Math.cos(phi);
    starPositions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({
    color: 0xdcefff,
    size: 0.052,
    transparent: true,
    opacity: 0.72,
    sizeAttenuation: true
})));

const earthGroup = new THREE.Group();
const orbitGroup = new THREE.Group();
scene.add(earthGroup, orbitGroup);

const earthRadius = 3.55;
const cubeSize = 0.205;
const latSteps = 48;
const lonSteps = 96;
const earthBlocks = new THREE.InstancedMesh(
    new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
    new THREE.MeshStandardMaterial({ roughness: 0.68, metalness: 0.06, vertexColors: true }),
    (latSteps - 1) * lonSteps
);
const colors = [0x06345a, 0x0878ad, 0x18bfe8, 0x53e7ff].map(value => new THREE.Color(value));
const dummy = new THREE.Object3D();
let blockIndex = 0;

for (let y = 1; y < latSteps; y++) {
    const latitude = Math.PI * (0.5 - y / latSteps);
    const cosLatitude = Math.cos(latitude);
    const sinLatitude = Math.sin(latitude);

    for (let x = 0; x < lonSteps; x++) {
        const longitude = (x / lonSteps) * Math.PI * 2 - Math.PI;
        const radius = earthRadius + (Math.random() - 0.5) * 0.025;
        dummy.position.set(
            radius * cosLatitude * Math.cos(longitude),
            radius * sinLatitude,
            radius * cosLatitude * Math.sin(longitude)
        );
        dummy.rotation.set(-latitude + Math.PI / 2, longitude + Math.PI / 2, 0);
        dummy.updateMatrix();
        earthBlocks.setMatrixAt(blockIndex, dummy.matrix);
        const brightness = Math.random();
        const colorIndex = brightness > 0.90 ? 3 : brightness > 0.67 ? 2 : brightness > 0.25 ? 1 : 0;
        earthBlocks.setColorAt(blockIndex, colors[colorIndex]);
        blockIndex++;
    }
}

earthBlocks.count = blockIndex;
earthBlocks.instanceMatrix.needsUpdate = true;
earthBlocks.instanceColor.needsUpdate = true;
earthBlocks.frustumCulled = false;
earthGroup.add(earthBlocks);

earthGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius + 0.18, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x43ddff, transparent: true, opacity: 0.055, side: THREE.BackSide })
));

const atmosphereRing = new THREE.Mesh(
    new THREE.TorusGeometry(earthRadius + 0.17, 0.012, 8, 180),
    new THREE.MeshBasicMaterial({ color: 0x5ceaff, transparent: true, opacity: 0.32 })
);
atmosphereRing.rotation.x = Math.PI / 2.3;
earthGroup.add(atmosphereRing);
earthGroup.rotation.set(0.08, -0.42, THREE.MathUtils.degToRad(-8));

const eventData = [
    { radius: 6.0, phase: 0.4, tilt: 0.18, speed: 0.115, color: 0x52e7ff, size: 0.34 },
    { radius: 5.65, phase: 2.1, tilt: -0.20, speed: 0.138, color: 0x76a7ff, size: 0.28 },
    { radius: 6.25, phase: 3.7, tilt: 0.30, speed: 0.094, color: 0xb2ffdc, size: 0.31 },
    { radius: 5.75, phase: 4.8, tilt: 0.42, speed: 0.126, color: 0x63c8ff, size: 0.27 },
    { radius: 6.15, phase: 5.65, tilt: -0.38, speed: 0.103, color: 0x8bffcb, size: 0.30 },
    { radius: 5.85, phase: 1.15, tilt: -0.48, speed: 0.132, color: 0xc2d8ff, size: 0.25 }
];

const eventMoons = [];

function makeOrbit(radius, tilt) {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.88, 0, Math.PI * 2);
    const points = curve.getPoints(220).map(point => new THREE.Vector3(point.x, 0, point.y));
    const line = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x9adfff, transparent: true, opacity: 0.09 })
    );
    line.rotation.x = tilt;
    return line;
}

for (const data of eventData) {
    orbitGroup.add(makeOrbit(data.radius, data.tilt));
    const moon = new THREE.Group();
    moon.add(new THREE.Mesh(
        new THREE.IcosahedronGeometry(data.size, 2),
        new THREE.MeshStandardMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.62,
            roughness: 0.3,
            metalness: 0.18
        })
    ));
    moon.add(new THREE.Mesh(
        new THREE.SphereGeometry(data.size * 1.75, 16, 16),
        new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.045 })
    ));
    orbitGroup.add(moon);
    eventMoons.push({ group: moon, ...data });
}

function positionMoon(moon, angle) {
    const x = Math.cos(angle) * moon.radius;
    const orbitDepth = Math.sin(angle) * moon.radius * 0.88;
    moon.group.position.set(
        x,
        -orbitDepth * Math.sin(moon.tilt),
        orbitDepth * Math.cos(moon.tilt)
    );
}

function setSceneLayout() {
    const earthPosition = getEarthPosition();
    earthGroup.position.copy(earthPosition);
    orbitGroup.position.copy(earthPosition);
    camera.position.copy(getCameraPosition());
    camera.lookAt(cameraTarget);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = window.innerWidth < 700 ? 42 : 34;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    setSceneLayout();
}

window.addEventListener('resize', onResize);

setSceneLayout();
eventMoons.forEach(moon => positionMoon(moon, moon.phase));

const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
    requestAnimationFrame(animate);

    // Clamp the delta so returning to a backgrounded tab never causes a jump.
    elapsed += Math.min(clock.getDelta(), 0.05);
    earthGroup.rotation.y = -0.42 + elapsed * 0.075;
    atmosphereRing.rotation.z = elapsed * 0.035;

    for (const moon of eventMoons) {
        positionMoon(moon, moon.phase + elapsed * moon.speed);
        moon.group.rotation.y = elapsed * 0.35;
        moon.group.rotation.x = elapsed * 0.16;
    }

    renderer.render(scene, camera);
}

animate();
