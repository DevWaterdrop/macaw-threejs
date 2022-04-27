import { Storage } from "./Core/Core.types";
import { SceneSettings } from "./Core/Scene/Scene.types";

export enum SCENE_TYPE {
	fixed = "fixed",
	absolute = "absolute"
}

export enum SCENE_DEFAULTS {
	near = 70,
	far = 2000,

	//* Camera
	cameraFov = 70,
	positionZ = 600,

	//* Renderer
	maxDPR = 1.75
}

export const RENDER_TIME = 0.5;

export const SCENE_SETTINGS_DEFAULTS: Omit<Required<SceneSettings>, "type"> = {
	alpha: true,
	color: 0xffffff,
	maxDPR: SCENE_DEFAULTS.maxDPR
};

export const STORAGE_DEFAULTS: Storage = {
	images: [],
	effects: new Map(),
	meshImages: new Map()
};
