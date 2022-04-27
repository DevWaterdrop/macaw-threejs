import type { Composer, Image } from "./controllers/Shader/Shader.types";
import type { Dimensions, SceneSettings } from "./Core/Scene/Scene.types";
import * as THREE from "three";
import { SCENE_DEFAULTS } from "./constants";
import { MacawComposerShader } from "./Core/Shader/Composer";
import { MacawImageShader } from "./Core/Shader/Image";
import { calculateCameraFov } from "./utils/calculate_camera_fov";

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
}
export function initCamera({ dimensions }: InitCameraProps) {
	const camera = new THREE.PerspectiveCamera(
		SCENE_DEFAULTS.cameraFov,
		dimensions.width / dimensions.height,
		SCENE_DEFAULTS.near,
		SCENE_DEFAULTS.far
	);

	camera.position.z = SCENE_DEFAULTS.positionZ;
	camera.position.y = 0;

	camera.fov = calculateCameraFov(dimensions.height, camera.position.z);

	return camera;
}

interface InitRendererProps {
	container: HTMLDivElement;
	settings: Required<SceneSettings>;
}
export function initRenderer({ container, settings }: InitRendererProps) {
	const renderer = new THREE.WebGLRenderer({
		powerPreference: "high-performance",
		alpha: settings.alpha
	});

	renderer.setPixelRatio(Math.min(devicePixelRatio, settings.maxDPR));
	container.appendChild(renderer.domElement);

	return renderer;
}

export function initRaycaster() {
	const raycaster = new THREE.Raycaster();

	raycaster.near = SCENE_DEFAULTS.near;
	raycaster.far = SCENE_DEFAULTS.far;

	return raycaster;
}

export function initImage(): Image {
	const shader = new MacawImageShader();
	const baseMaterial = new THREE.ShaderMaterial({
		uniforms: shader.uniforms,
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader
	});

	return { shader, baseMaterial };
}

export function initComposer(): Composer {
	const shader = new MacawComposerShader();
	const shaderEffect = {
		uniforms: shader.uniforms,
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader
	};

	return { shader, shaderEffect };
}
