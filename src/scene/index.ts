import * as THREE from "three";
import { MacawComposer } from "../composer";
import { MacawComposerShader } from "../shaders/composerShader";
import { RENDER_OBJ_DEFAULTS, SCENE_DEFAULTS, SCENE_TYPE } from "../constants";
import { MacawScroll } from "../scroll";
import {
	initCamera,
	initComposer,
	initImage,
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
	alpha?: boolean;
	color?: number;
	maxDPR?: number;
	type?: SCENE_TYPE;
};

export type MapEffects = Map<string, GeneralEffect>;

export type Dimensions = { width: number; height: number };

export type Render = {
	isManualShouldRender: boolean;
	isImage: boolean;
	isShaderPass: boolean;
	countClickRender: number;
	countEffectsShaderPass: number;
	countEffectsImage: number;
};

export type Image = {
	shader: MacawImageShader;
	baseMaterial: THREE.ShaderMaterial;
};

export type Composer = {
	shader: MacawComposerShader;
	shaderEffect: {
		uniforms: Uniform;
		fragmentShader: string;
		vertexShader: string;
	};
};

type MapMeshImages = Map<string, MacawImage>;

type Core = {
	readonly container: HTMLDivElement;
	dimensions: Dimensions;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	raycaster: THREE.Raycaster;
};

type Utils = {
	readonly vector2: THREE.Vector2;
};

type Storage = {
	readonly mapMeshImages: MapMeshImages;
	readonly mapEffects: Map<string, GeneralEffect>;
	readonly images: HTMLImageElement[];
};

type Macaws = {
	composer: MacawComposer;
	scroll: MacawScroll;
	resize: MacawResize;
	observer: MacawObserver;
};

export class MacawScene {
	time: number;
	settings: Required<SceneSettings>;

	utils: Utils;
	render: Render;
	macaws: Macaws;
	storage: Storage;
	readonly core: Core;
	readonly image: Image;
	readonly composer: Composer;

	constructor(options: Props) {
		const { container, sceneSettings } = options;

		const { position } = window.getComputedStyle(container);
		const type = Object.keys(SCENE_TYPE).includes(position)
			? (position as SCENE_TYPE)
			: SCENE_TYPE.absolute;

		this.settings = {
			alpha: true,
			color: 0xffffff,
			type,
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
		this.utils = {
			vector2: new THREE.Vector2()
		};
		this.storage = {
			images: [],
			mapEffects: new Map(),
			mapMeshImages: new Map()
		};
		this.render = RENDER_OBJ_DEFAULTS;
		this.image = initImage();

		const scroll = new MacawScroll({ scene: this });

		this.composer = initComposer();

		this.core = {
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

		this.macaws = { composer, scroll, resize, observer };
		//* -- end of Default settings

		this._init();
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
		this.render.isManualShouldRender = false;

		// ? Change only changed 💁‍♂️
		this.core.scene.background = new THREE.Color(sceneSettings.color);

		this.settings = { ...this.settings, ...sceneSettings };
		this.manualRender();
	}

	set CountEffectsShaderPass(value: number) {
		this.render.countEffectsShaderPass += value;
		this.render.isShaderPass = this.render.countEffectsShaderPass > 0;
	}

	set CountEffectsImage(value: number) {
		this.render.countEffectsImage += value;
		this.render.isImage = this.render.countEffectsImage > 0;
	}
	//* -- end of SETTERs

	//! Render
	private _render() {
		this.time += SCENE_DEFAULTS.time;

		if (this.render.isShaderPass) {
			this.macaws.scroll.scrollSpeedRender();
		}

		if (this.shouldRender()) {
			this.manualRender();
		}

		window.requestAnimationFrame(this._render.bind(this));
	}

	private _init() {
		this.macaws.scroll.scroll();
		this.macaws.resize.resize();

		this.macaws.scroll.setupScroll();
		this.macaws.resize.setup();

		this._render();
		this.manualRender();
	}
}
