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
debugObject.initial = {
	wireframe: false,
	color1: "#8ecae6",
	color2: "#219ebc",
	color3: "#023047",
	color4: "#ffb703",
	color5: "#fb8500",
	cameraPosition: {
		x: 0.075,
		y: 0.175,
		z: 0.075,
	},
	noiseSettings: {
		amount: 0.1,
		speed: 0.1,
		frequency: { x: 3, y: 6 },
	},
};

debugObject.wireframe = debugObject.initial.wireframe;
debugObject.color1 = debugObject.initial.color1;
debugObject.color2 = debugObject.initial.color2;
debugObject.color3 = debugObject.initial.color3;
debugObject.color4 = debugObject.initial.color4;
debugObject.color5 = debugObject.initial.color5;
debugObject.cameraPosition = { ...debugObject.initial.cameraPosition };

const gradientMaterial = new THREE.ShaderMaterial({
	uniforms: {
		uColor: {
			value: [
				new THREE.Color(debugObject.initial.color1),
				new THREE.Color(debugObject.initial.color2),
				new THREE.Color(debugObject.initial.color3),
			],
		},
		uTime: { value: 0 },
		uAmount: { value: debugObject.initial.noiseSettings.amount },
		uSpeed: { value: debugObject.initial.noiseSettings.speed },
		uFrequency: {
			value: new THREE.Vector2(
				debugObject.initial.noiseSettings.frequency.x,
				debugObject.initial.noiseSettings.frequency.y,
			),
		},
		uEnableGrain: { value: false },
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

meshFolder.addBinding(gradientMaterial.uniforms.uEnableGrain, "value", {
	label: "grain",
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
	y: 0.2,
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
	title: "🎥 Edit Camera",
});
cameraEditButton.on("click", () => {
	debugObject.editCamera = !debugObject.editCamera;
	controls.enabled = debugObject.editCamera;

	if (!debugObject.editCamera) {
		resetCamera();
	}

	cameraEditButton.title = debugObject.editCamera
		? "🎥 Reset Camera"
		: "🎥 Edit Camera";
});

const randomizeColorsButton = pane.addButton({
	title: "🎨 Randomize Colors",
	disabled: false,
});

randomizeColorsButton.on("click", () => {
	// Generate random colors
	const randomColor = () => {
		const hue = Math.random();
		const saturation = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
		const lightness = 0.4 + Math.random() * 0.4; // 0.4 to 0.8
		return `hsl(${hue * 360}, ${saturation * 100}%, ${lightness * 100}%)`;
	};

	// Update debug object colors
	debugObject.color1 = randomColor();
	debugObject.color2 = randomColor();
	debugObject.color3 = randomColor();
	debugObject.color4 = randomColor();
	debugObject.color5 = randomColor();

	// Update material uniforms
	gradientMaterial.uniforms.uColor.value[0].set(debugObject.color1);
	gradientMaterial.uniforms.uColor.value[1].set(debugObject.color2);
	gradientMaterial.uniforms.uColor.value[2].set(debugObject.color3);

	// Update the color pickers in the UI
	colorFolder.refresh();
});

const exportImageButton = pane.addButton({
	title: "🖼️ Export Image",
	disabled: false,
});

exportImageButton.on("click", () => {
	// Render the scene
	renderer.render(scene, camera);

	try {
		// Get the canvas data as a data URL
		const dataURL = renderer.domElement.toDataURL("image/png");

		// Create a temporary link element
		const link = document.createElement("a");
		link.href = dataURL;
		link.download = `gradient-${Date.now()}.png`;

		// Programmatically click the link to trigger the download
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		console.error("Error exporting image:", error);
		alert("Failed to export image. Please try again.");
	}
});

pane.addBlade({
	view: "separator",
});

const resetButton = pane.addButton({
	title: "🔄 Reset",
	disabled: false,
});

resetButton.on("click", () => {
	// Reset colors
	debugObject.color1 = debugObject.initial.color1;
	debugObject.color2 = debugObject.initial.color2;
	debugObject.color3 = debugObject.initial.color3;
	debugObject.color4 = debugObject.initial.color4;
	debugObject.color5 = debugObject.initial.color5;

	// Update material uniforms
	gradientMaterial.uniforms.uColor.value[0].set(debugObject.initial.color1);
	gradientMaterial.uniforms.uColor.value[1].set(debugObject.initial.color2);
	gradientMaterial.uniforms.uColor.value[2].set(debugObject.initial.color3);

	// Reset noise settings
	gradientMaterial.uniforms.uAmount.value =
		debugObject.initial.noiseSettings.amount;
	gradientMaterial.uniforms.uSpeed.value =
		debugObject.initial.noiseSettings.speed;
	gradientMaterial.uniforms.uFrequency.value.set(
		debugObject.initial.noiseSettings.frequency.x,
		debugObject.initial.noiseSettings.frequency.y,
	);

	// Reset wireframe
	debugObject.wireframe = debugObject.initial.wireframe;
	gradientMaterial.wireframe = debugObject.initial.wireframe;

	// Reset camera
	debugObject.editCamera = false;
	controls.enabled = false;
	camera.position.set(
		debugObject.initial.cameraPosition.x,
		debugObject.initial.cameraPosition.y,
		debugObject.initial.cameraPosition.z,
	);
	controls.target.set(0, 0, 0);
	controls.update();

	// Update UI
	colorFolder.refresh();
	noiseFolder.refresh();
	meshFolder.refresh();
	cameraEditButton.title = "🎥 Edit Camera";
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
