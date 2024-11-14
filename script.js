import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { MathUtils, Vector3 } from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;  

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

const sky = new Sky();
sky.scale.setScalar(450000);

const phi = MathUtils.degToRad(280);
const theta = MathUtils.degToRad(180);
const sunPosition = new Vector3().setFromSphericalCoords(1, phi, theta);
sky.material.uniforms.sunPosition.value = sunPosition;

scene.add(sky);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(50, 50, 30);
directionalLight.castShadow = true; 

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;

scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xfff2cc, 0x999999, 1);
scene.add(hemisphereLight);

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0, 17.5, -22.5);
spotLight.intensity = 100;
spotLight.penumbra = 0.3;
spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

const target = new THREE.Object3D();
target.position.set(0, 0, -22.5);
scene.add(target);

spotLight.target = target;

scene.add(spotLight);

const controls1 = new PointerLockControls(camera, document.body);
controls1.lock();

const loader = new GLTFLoader().setPath('/3d/');
loader.load(
    'school3dwebsite.gltf',
    (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true; 
                child.receiveShadow = true;
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
