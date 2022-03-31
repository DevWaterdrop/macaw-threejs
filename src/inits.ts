import * as THREE from "three";
import { SCENE_DEFAULTS, SCENE_TYPE } from "./constants";
import type { Dimensions, SceneSettings } from "./scene";
import type { MacawScroll } from "./scroll";

interface InitSceneProps {
	settings: SceneSettings;
}
export function initScene({ settings }: InitSceneProps) {
	const scene = new THREE.Scene();

	if (!settings.alpha) {
		scene.background = new THREE.Color(settings.color);
	}

	return scene;
}

interface InitCameraProps {
	dimensions: Dimensions;
	macawScroll: MacawScroll;
	type: SCENE_TYPE;
}
export function initCamera({ dimensions, macawScroll, type }: InitCameraProps) {
	const camera = new THREE.PerspectiveCamera(
		SCENE_DEFAULTS.cameraFov,
		dimensions.width / dimensions.height,
		SCENE_DEFAULTS.near,
		SCENE_DEFAULTS.far
	);

	camera.position.z = SCENE_DEFAULTS.positionZ;
	camera.position.y = type === SCENE_TYPE.absolute ? 0 : -macawScroll.currentScroll;

	camera.fov = 2 * Math.atan(dimensions.height / 2 / camera.position.z) * (180 / Math.PI);

	return camera;
}

interface InitRendererProps {
	container: HTMLDivElement;
	settings: SceneSettings;
}
export function initRenderer({ container, settings }: InitRendererProps) {
	const renderer = new THREE.WebGLRenderer({
		powerPreference: "high-performance",
		alpha: settings.alpha
	});

	renderer.setPixelRatio(Math.min(devicePixelRatio, settings.maxDPR ?? 1.75));
	container.appendChild(renderer.domElement);

	return renderer;
}

export function initRaycaster() {
	const raycaster = new THREE.Raycaster();

	raycaster.near = SCENE_DEFAULTS.near;
	raycaster.far = SCENE_DEFAULTS.far;

	return raycaster;
}
