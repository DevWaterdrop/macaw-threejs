import { SCENE_TYPE } from "./constants";
import type { MacawImage } from "./image";
import type { MacawScene } from "./scene";

export abstract class Effect {
	scene?: MacawScene;
	isUsingShaderPass?: boolean;
	settings?: Record<string, unknown>;
	type?: Set<SCENE_TYPE>;

	// Image
	readonly imageFragmentString?: FragmentString;
	readonly imageVertexString?: VertexString;
	readonly imageUniforms?: Uniform;

	setImageUniforms?(img: MacawImage): void | unknown;
	// -- end of Image

	// Composer
	readonly composerFragmentString?: FragmentString;
	readonly composerVertexString?: VertexString;
	readonly composerUniforms?: Uniform;

	setComposerUniforms?(): void | unknown;
	// -- end of Composer

	setSettings?(...args: unknown[]): void | unknown;

	render?(): void | unknown;
	manualRender?(): void | unknown;
	add?(): void | unknown;

	scroll?(): void | unknown;
	click?(
		imageId: string,
		intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]
	): void | unknown;
	resize?(): void | unknown;
}

export type Uniform = Record<string, { value: unknown }>;

export type FragmentStringKeys = [
	"utils",
	"struct",
	"uniforms",
	"varying",
	"const",
	"functions",
	"beforeGl_FragColor",
	"afterGl_FragColor"
];

export type VertexStringKeys = [
	"utils",
	"struct",
	"uniforms",
	"varying",
	"const",
	"functions",
	"beforeGl_Position",
	"afterGl_Position"
];

export type FragmentString = Partial<Record<FragmentStringKeys[number], string>>;

export type VertexString = Partial<Record<VertexStringKeys[number], string>>;

export type GeneralEffect = Effect;
