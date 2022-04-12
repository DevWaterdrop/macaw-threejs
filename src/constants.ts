import type { RenderOBJ } from "./scene";

export enum SCENE_TYPE {
	fixed = "fixed",
	absolute = "absolute"
}

export enum SCENE_DEFAULTS {
	near = 70,
	far = 2000,
	time = 0.5,

	//* Camera
	cameraFov = 70,
	positionZ = 600,

	//* Renderer
	maxDPR = 1.75
}

export const RENDER_OBJ_DEFAULTS: RenderOBJ = {
	isManualShouldRender: false,
	isImage: false,
	isShaderPass: false,
	countClickRender: 0,
	countEffectsShaderPass: 0,
	countEffectsImage: 0
};
