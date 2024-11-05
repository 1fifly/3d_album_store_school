import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 25);

const controls = new FirstPersonControls(camera, renderer.domElement);
controls.activeLook = false;
controls.update();

const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

const loader = new GLTFLoader().setPath('/3d/');
loader.load(
    'untitled.gltf',
    (gltf) => {
        console.log('loading model');
        const mesh = gltf.scene;

        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        mesh.position.set(0, 1.05, -1);
        scene.add(mesh);

        document.getElementById('progress-container').style.display = 'none';
    },
    (xhr) => {
        console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
    },
    (error) => {
        console.error(error);
    }
);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;

        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        const targetPosition = camera.position.clone().add(direction.multiplyScalar(8));

        gsap.to(hitObject.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1
        });
    }
}

window.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
