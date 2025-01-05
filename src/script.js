import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";
import vertexShader from "./shaders/gradient/vertex.glsl";
import fragmentShader from "./shaders/gradient/fragment.glsl";

/**
 * Base
 */
// Debug
const debugObject = {};

const pane = new Pane({
	title: "Gradient Generator",
	expanded: true,
});
console.log(pane);
const meshFolder = pane.addFolder({
	title: "Mesh",
});
const colorFolder = pane.addFolder({
	title: "Color",
});
const noiseFolder = pane.addFolder({
	title: "Noise",
});

// Canvas
const canvas = document.querySelector("#webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Materials
 */
// Gradient material
debugObject.wireframe = false;
debugObject.color1 = "#ff0000";
debugObject.color2 = "#0000ff";

const gradientMaterial = new THREE.ShaderMaterial({
	uniforms: {
		uColor1: { value: new THREE.Color(debugObject.color1) },
		uColor2: { value: new THREE.Color(debugObject.color2) },
		uElevation: { value: 0.2 },
		uFrequency: { value: new THREE.Vector2(4, 1.5) },
		uTime: { value: 0 },
		uSpeed: { value: 0.02 },
	},
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
	side: THREE.DoubleSide,
	wireframe: debugObject.wireframe,
});

meshFolder
	.addBinding(debugObject, "wireframe", {
		label: "wireframe",
		view: "boolean",
	})
	.on("change", ({ value }) => {
		gradientMaterial.wireframe = value;
	});

colorFolder
	.addBinding(debugObject, "color1", {
		label: "color 1",
		view: "color",
	})
	.on("change", ({ value }) => {
		gradientMaterial.uniforms.uColor1.value = new THREE.Color(value);
	});

colorFolder
	.addBinding(debugObject, "color2", {
		label: "color 2",
		view: "color",
	})
	.on("change", ({ value }) => {
		gradientMaterial.uniforms.uColor2.value = new THREE.Color(value);
	});

/**
 * Object
 */
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1, 128, 128),
	gradientMaterial,
);

plane.rotation.x = -Math.PI / 2;
plane.rotation.z = Math.PI / 4;

noiseFolder.addBinding(gradientMaterial.uniforms.uElevation, "value", {
	label: "elevation",
	min: 0,
	max: 1,
	step: 0.01,
});

noiseFolder.addBinding(gradientMaterial.uniforms.uSpeed, "value", {
	label: "speed",
	min: 0,
	max: 0.5,
	step: 0.01,
});

noiseFolder.addBinding(gradientMaterial.uniforms.uFrequency.value, "x", {
	label: "freq x",
	min: 0,
	max: 10,
	step: 0.01,
});

noiseFolder.addBinding(gradientMaterial.uniforms.uFrequency.value, "y", {
	label: "freq y",
	min: 0,
	max: 10,
	step: 0.01,
});

scene.add(plane);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.x = 1;
camera.position.y = 1.25;
camera.position.z = 1;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update material
	plane.material.uniforms.uTime.value = elapsedTime;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
