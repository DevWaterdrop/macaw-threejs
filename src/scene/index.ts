import * as THREE from "three";
import { MacawComposer } from "../composer";
import { MacawComposerShader } from "../shaders/composerShader";
import { RENDER_OBJ_DEFAULTS, SCENE_DEFAULTS, SCENE_TYPE } from "../constants";
import { MacawScroll } from "../scroll";
import {
	initCamera,
	initComposerOBJ,
	initImageOBJ,
	initRaycaster,
	initRenderer,
	initScene
} from "../inits";
import { MacawResize } from "../resize";
import type { MacawImage } from "../image";
import type { GeneralEffect, Uniform } from "../effect";
import type { MacawImageShader } from "../shaders/imageShader";
import { MacawObserver } from "../observer";
import * as METHODS from "./methods";
import { AddEffectProps } from "./methods/addEffect";
import { RemoveEffectProps } from "./methods/removeEffect";
import { SetImagesPositionProps } from "./methods/setImagesPosition";
import { SetUniformsProps } from "./methods/setUniforms";

interface Props {
	container: HTMLDivElement;
	sceneSettings: SceneSettings;
}

export type SceneSettings = {
	alpha: boolean;
	color: number;
	maxDPR?: number;
	type?: SCENE_TYPE;
};

export type MapEffects = Map<string, GeneralEffect>;

export type Dimensions = { width: number; height: number };

export type RenderOBJ = {
	isManualShouldRender: boolean;
	isImage: boolean;
	isShaderPass: boolean;
	countClickRender: number;
	countEffectsShaderPass: number;
	countEffectsImage: number;
};

export type ImageOBJ = {
	shader: MacawImageShader;
	baseMaterial: THREE.ShaderMaterial;
};

export type ComposerOBJ = {
	shader: MacawComposerShader;
	shaderEffect: {
		uniforms: Uniform;
		fragmentShader: string;
		vertexShader: string;
	};
};

type MapMeshImages = Map<string, MacawImage>;

type CoreOBJ = {
	readonly container: HTMLDivElement;
	dimensions: Dimensions;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	raycaster: THREE.Raycaster;
};

type UtilsOBJ = {
	readonly vector2: THREE.Vector2;
};

type StorageOBJ = {
	readonly mapMeshImages: MapMeshImages;
	readonly mapEffects: Map<string, GeneralEffect>;
	readonly images: HTMLImageElement[];
};

type MacawOBJ = {
	composer: MacawComposer;
	scroll: MacawScroll;
	resize: MacawResize;
	observer: MacawObserver;
};

export class MacawScene {
	time: number;
	settings: Required<SceneSettings>;

	utilsOBJ: UtilsOBJ;
	renderOBJ: RenderOBJ;
	macawOBJ: MacawOBJ;
	storageOBJ: StorageOBJ;
	readonly coreOBJ: CoreOBJ;
	readonly imageOBJ: ImageOBJ;
	readonly composerOBJ: ComposerOBJ;

	constructor(options: Props) {
		const { container, sceneSettings } = options;

		this.settings = {
			type: SCENE_TYPE.absolute,
			maxDPR: SCENE_DEFAULTS.maxDPR,
			...sceneSettings
		};

		const dimensions: Dimensions = {
			width: container.offsetWidth,
			height: container.offsetHeight
		};

		//* Default settings
		this.time = 0;
		// OBJs
		this.utilsOBJ = {
			vector2: new THREE.Vector2()
		};
		this.storageOBJ = {
			images: [],
			mapEffects: new Map(),
			mapMeshImages: new Map()
		};
		this.renderOBJ = RENDER_OBJ_DEFAULTS;
		this.imageOBJ = initImageOBJ();

		const scroll = new MacawScroll({ scene: this });

		this.composerOBJ = initComposerOBJ();

		this.coreOBJ = {
			container,
			dimensions,
			scene: initScene({ settings: this.settings }),
			camera: initCamera({
				dimensions,
				macawScroll: scroll,
				type: this.settings.type
			}),
			renderer: initRenderer({ container: container, settings: this.settings }),
			raycaster: initRaycaster()
		};

		const composer = new MacawComposer({ scene: this });
		const resize = new MacawResize({ scene: this });
		const observer = new MacawObserver({ scene: this });

		this.macawOBJ = { composer, scroll, resize, observer };
		//* -- end of Default settings

		this.init();
	}

	addEffect = (props: AddEffectProps) => METHODS.addEffect.bind(this)(props);

	removeEffect = (props: RemoveEffectProps) => METHODS.removeEffect.bind(this)(props);

	setImagesPosition = (props?: SetImagesPositionProps) => {
		return METHODS.setImagesPosition.bind(this)(props ?? {});
	};

	setUniforms = (props: SetUniformsProps) => METHODS.setUniforms.bind(this)(props);

	manualRender = () => METHODS.manualRender.bind(this)();

	cleanUp = () => METHODS.cleanUp.bind(this)();

	shouldRender = () => METHODS.shouldRender.bind(this)();

	//* SETTERs
	set Settings(sceneSettings: SceneSettings) {
		this.renderOBJ.isManualShouldRender = false;

		// TODO Change only changed 💁‍♂️
		this.coreOBJ.scene.background = new THREE.Color(sceneSettings.color);

		this.settings = { ...this.settings, ...sceneSettings };
		this.manualRender();
	}

	set Image(image: MacawImage) {
		this.storageOBJ.mapMeshImages.set(image.element.id, image);

		this.setImagesPosition();
		this.manualRender();
	}

	set CountEffectsShaderPass(value: number) {
		this.renderOBJ.countEffectsShaderPass += value;
		this.renderOBJ.isShaderPass = this.renderOBJ.countEffectsShaderPass > 0;
	}

	set CountEffectsImage(value: number) {
		this.renderOBJ.countEffectsImage += value;
		this.renderOBJ.isImage = this.renderOBJ.countEffectsImage > 0;
	}
	//* -- end of SETTERs

	//! Render
	private render() {
		this.time += SCENE_DEFAULTS.time;

		if (this.renderOBJ.isShaderPass) {
			this.macawOBJ.scroll.scrollSpeedRender();
		}

		if (this.shouldRender()) {
			this.manualRender();
		}

		window.requestAnimationFrame(this.render.bind(this));
	}

	private init() {
		this.macawOBJ.scroll.scroll();
		this.macawOBJ.resize.resize();

		this.macawOBJ.scroll.setupScroll();
		this.macawOBJ.resize.setup();

		this.render();
		this.manualRender();
	}
}
