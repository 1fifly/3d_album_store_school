import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = false;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7.5, 40);

const controls = new FirstPersonControls(camera, renderer.domElement);
controls.lookSpeed = 0.05;
controls.movementSpeed = 1;
controls.noFly = true;
controls.lookVertical = true;
controls.verticalMin = Math.PI / 6;
controls.verticalMax = Math.PI / 3;
controls.enabled = false;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(10, 10, 10);
scene.add(ambientLight, directionalLight);

const controls1 = new PointerLockControls(camera, document.body);
controls1.lock();

const loader = new GLTFLoader().setPath('/3d/');
loader.load(
    'school3dwebsite.gltf',
    (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });
        mesh.position.set(0, 1.05, -1);
        scene.add(mesh);
    },
    (xhr) => {
        console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    (error) => {
        console.error('An error happened', error);
    }
);

function onMouseClick(event) {
    controls.enabled = false;
    gsap.to(camera.position, {
        x: 0,
        y: 7.5,
        z: -22.5,
        duration: 3,
        ease: 'strong.inOut',
        onStart: () => {
            const title = document.querySelector('.title');
            title.style.display = "none";
        },
        onComplete: () => {
            controls.enabled = true;
        }
    });
}

window.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update(0.05);
    renderer.render(scene, camera);
}

animate();
