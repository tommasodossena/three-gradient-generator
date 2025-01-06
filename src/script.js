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
debugObject.color1 = "#8ecae6";
debugObject.color2 = "#219ebc";
debugObject.color3 = "#023047";
debugObject.color4 = "#ffb703";
debugObject.color5 = "#fb8500";

const gradientMaterial = new THREE.ShaderMaterial({
	uniforms: {
		uColor: {
			value: [
				new THREE.Color(debugObject.color1),
				new THREE.Color(debugObject.color2),
				new THREE.Color(debugObject.color3),
				new THREE.Color(debugObject.color4),
				new THREE.Color(debugObject.color5),
			],
		},
		uTime: { value: 0 },
		uAmount: { value: 0.1 },
		uSpeed: { value: 0.02 },
		uFrequency: { value: new THREE.Vector2(3, 6) },
	},
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
	wireframe: debugObject.wireframe,
	side: THREE.DoubleSide,
});

colorFolder
	.addBinding(debugObject, "color1", {
		label: "color 1",
		view: "color",
	})
	.on("change", ({ value }) => {
		gradientMaterial.uniforms.uColor.value[0] = new THREE.Color(value);
	});

colorFolder
	.addBinding(debugObject, "color2", {
		label: "color 2",
		view: "color",
	})
	.on("change", ({ value }) => {
		gradientMaterial.uniforms.uColor.value[1] = new THREE.Color(value);
	});

colorFolder
	.addBinding(debugObject, "color3", {
		label: "color 3",
		view: "color",
	})
	.on("change", ({ value }) => {
		gradientMaterial.uniforms.uColor.value[2] = new THREE.Color(value);
	});

colorFolder
	.addBinding(debugObject, "color4", {
		label: "color 4",
		view: "color",
	})
	.on("change", ({ value }) => {
		gradientMaterial.uniforms.uColor.value[3] = new THREE.Color(value);
	});

colorFolder
	.addBinding(debugObject, "color5", {
		label: "color 5",
		view: "color",
	})
	.on("change", ({ value }) => {
		gradientMaterial.uniforms.uColor.value[4] = new THREE.Color(value);
	});

/**
 * Object
 */
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1, 256, 256),
	gradientMaterial,
);

plane.rotation.x = -Math.PI / 2;
plane.rotation.z = Math.PI / 4;

meshFolder
	.addBinding(debugObject, "wireframe", {
		label: "wireframe",
		view: "boolean",
	})
	.on("change", ({ value }) => {
		gradientMaterial.wireframe = value;
	});

noiseFolder.addBinding(gradientMaterial.uniforms.uAmount, "value", {
	label: "amount",
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

noiseFolder.addBinding(gradientMaterial.uniforms.uFrequency, "value", {
	label: "frequency",
	min: 0,
	max: 10,
	step: 0.01,
	picker: "inline",
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
debugObject.editCamera = false;
debugObject.cameraPosition = {
	x: 0.075,
	y: 0.175,
	z: 0.075,
};

const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100,
);

camera.position.set(
	debugObject.cameraPosition.x,
	debugObject.cameraPosition.y,
	debugObject.cameraPosition.z,
);

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enabled = false;
controls.enableDamping = true;
controls.minDistance = 0.175;
controls.maxDistance = 3;

const resetCamera = () => {
	// Reset camera position
	camera.position.set(
		debugObject.cameraPosition.x,
		debugObject.cameraPosition.y,
		debugObject.cameraPosition.z,
	);

	// Reset controls target to origin
	controls.target.set(0, 0, 0);
	controls.update();
};

const cameraEditButton = pane.addButton({
	title: "Edit Camera",
});
cameraEditButton.on("click", () => {
	debugObject.editCamera = !debugObject.editCamera;
	controls.enabled = debugObject.editCamera;

	if (!debugObject.editCamera) {
		resetCamera();
	}

	cameraEditButton.title = debugObject.editCamera
		? "Reset Camera"
		: "Edit Camera";
});

const randomizeColorsButton = pane.addButton({
	title: "Randomize Colors",
	disabled: true,
});

randomizeColorsButton.on("click", () => {
	console.log("randomize");
});

const exportImageButton = pane.addButton({
	title: "Export Image",
	disabled: true,
});
exportImageButton.on("click", () => {
	console.log("export");
});

pane.addBlade({
	view: "separator",
});

const resetButton = pane.addButton({
	title: "Reset",
	disabled: true,
});
resetButton.on("click", () => {
	console.log("reset");
});

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
