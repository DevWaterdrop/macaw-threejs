import * as THREE from "three";
import type { MacawImage } from "./image";
import { MacawComposer } from "./composer";
import type { GeneralEffect } from "./effect";
import { MacawImageShader } from "./shaders/imageShader";
import { MacawComposerShader } from "./shaders/composerShader";
import { SCENE_TYPE } from "./constants";
import { MacawScroll } from "./scroll";
import { initCamera, initRaycaster, initRenderer, initScene } from "./inits";
import { MacawResize } from "./resize";

interface Props {
	container: HTMLDivElement;
	sceneSettings: SceneSettings;
	type?: SCENE_TYPE;
}

export type SceneSettings = {
	alpha: boolean;
	color: number;
	maxDPR?: number;
};

type MapMeshImages = Map<string, MacawImage>;
export type MapEffects = Map<string, GeneralEffect>;

export type Dimensions = { width: number; height: number };

export class MacawScene {
	manualShouldRender: boolean;
	observer: IntersectionObserver;
	settings: SceneSettings;
	clickRender: number;
	dimensions: Dimensions;
	shaderEffect: Record<string, unknown>;
	countEffectsShaderPass: number;
	countEffectsImage: number;
	isShaderPass: boolean;
	isImage: boolean;
	macawComposer: MacawComposer;
	macawScroll: MacawScroll;
	macawResize: MacawResize;

	readonly type: SCENE_TYPE;
	readonly baseMaterial: THREE.ShaderMaterial;
	readonly raycaster: THREE.Raycaster;
	readonly vector2: THREE.Vector2;
	readonly camera: THREE.PerspectiveCamera;
	readonly scene: THREE.Scene;
	readonly mapMeshImages: MapMeshImages;
	readonly mapEffects: Map<string, GeneralEffect>;
	readonly imageShader: MacawImageShader;
	readonly composerShader: MacawComposerShader;
	readonly renderer: THREE.WebGLRenderer;
	readonly container: HTMLDivElement;
	readonly images: HTMLImageElement[];

	private time: number;

	constructor(options: Props) {
		const { container, sceneSettings, type } = options;

		this.container = container;
		this.settings = sceneSettings;
		this.type = type || SCENE_TYPE.absolute;

		//* Default settings
		this.time = 0;
		// scroll
		this.macawScroll = new MacawScroll({ scene: this });
		// render
		this.manualShouldRender = false;
		this.clickRender = 0;
		this.countEffectsShaderPass = 0;
		this.countEffectsImage = 0;
		this.isShaderPass = false;
		this.isImage = false;
		// map
		this.images = [];
		this.mapEffects = new Map();
		this.mapMeshImages = new Map();
		// utils
		this.vector2 = new THREE.Vector2();
		this.observer = new IntersectionObserver(this.ObserverCallback.bind(this));
		// image
		this.imageShader = new MacawImageShader();
		this.baseMaterial = new THREE.ShaderMaterial({
			uniforms: this.imageShader.uniforms,
			fragmentShader: this.imageShader.fragmentShader,
			vertexShader: this.imageShader.vertexShader
		});
		// composer
		this.composerShader = new MacawComposerShader();
		this.shaderEffect = {
			uniforms: this.composerShader.uniforms,
			fragmentShader: this.composerShader.fragmentShader,
			vertexShader: this.composerShader.vertexShader
		};
		//
		this.dimensions = {
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		};
		// resize
		this.macawResize = new MacawResize({ scene: this });
		//* -- end of Default settings

		this.scene = initScene({ settings: this.settings });
		this.camera = initCamera({
			dimensions: this.dimensions,
			macawScroll: this.macawScroll,
			type: this.type
		});
		this.renderer = initRenderer({ container: this.container, settings: this.settings });
		this.raycaster = initRaycaster();

		//* Composer
		this.macawComposer = new MacawComposer({
			scene: this.scene,
			camera: this.camera,
			renderer: this.renderer,
			dimensions: this.dimensions,
			shaderEffect: this.shaderEffect
		});
		//* -- end of Composer

		//* Init
		this.macawScroll.scroll();
		this.macawResize.resize();

		this.macawScroll.setupScroll();
		this.macawResize.setup();

		this.render();
		this.manualRender();
	}

	// TODO Same code in removeEffect
	addEffect(key: string, effect: GeneralEffect) {
		if (!effect.type?.has(this.type)) {
			throw new Error(`This effect doesn't support - type: ${this.type}`);
		}

		if (this.mapEffects.has(key)) {
			this.removeEffect(key);
			return false;
		}

		effect.scene = this;
		this.mapEffects.set(key, effect);

		if (effect.composerFragmentString !== undefined) {
			this.CountEffectsShaderPass = 1;

			this.composerShader.create(this.mapEffects);
			this.macawComposer.refreshShaderPass(this.composerShader, effect.composerUniforms);
		}
		if (effect.imageFragmentString !== undefined) {
			this.CountEffectsImage = 1;

			this.imageShader.create(this.mapEffects);
			this.mapMeshImages.forEach((img) => {
				img.refreshMaterial(effect.imageUniforms);
			});
		}

		this.manualRender(); // TODO maybe remove

		return true;
	}

	removeEffect(key: string) {
		if (!this.mapEffects.has(key)) return false;

		const effect = { ...this.mapEffects.get(key) };
		this.mapEffects.delete(key);

		if (effect.composerFragmentString !== undefined) {
			this.CountEffectsShaderPass = -1;

			this.composerShader.create(this.mapEffects);
			this.macawComposer.refreshShaderPass(this.composerShader);
		}
		if (effect.imageFragmentString !== undefined) {
			this.CountEffectsImage = -1;

			this.imageShader.create(this.mapEffects);
			this.mapMeshImages.forEach((img) => img.refreshMaterial());
		}

		this.manualRender(); // TODO maybe remove

		return true;
	}

	manualRender() {
		const isShaderPass = this.countEffectsShaderPass > 0;
		// ? Maybe set uniforms only if at least one effect is enabled from previewSettings 🧐
		this.setUniforms({ image: true, shaderPass: isShaderPass });

		this.mapEffects.forEach((effect) => {
			if (effect.manualRender) effect.manualRender();
		});

		// ? Find better performance solution
		if (this.isShaderPass) {
			if (this.macawScroll.scrollTimes <= 1) this.renderer.render(this.scene, this.camera); //! Temporarily fix
			this.macawComposer.composer.render();
		} else {
			this.renderer.render(this.scene, this.camera);
		}
	}

	cleanUp() {
		this.macawResize.cleanUp();
		this.macawScroll.cleanUp();
		this.mapMeshImages.forEach((img) => {
			img.cleanUp();
		});
		this.observer.disconnect();
	}

	shouldRender() {
		if (this.manualShouldRender) return true;
		return false;
	}

	setImagesPosition(resize = false) {
		this.mapMeshImages.forEach((img) => {
			img.setPosition(resize);
		});
	}

	//* SETTER
	set Settings(sceneSettings: SceneSettings) {
		this.manualShouldRender = false;

		// TODO Change only changed 💁‍♂️
		this.scene.background = new THREE.Color(sceneSettings.color);

		this.settings = sceneSettings;
		this.manualRender();
	}

	set Image(image: MacawImage) {
		this.mapMeshImages.set(image.element.id, image);

		this.setImagesPosition();
		this.manualRender();
	}

	set CountEffectsShaderPass(value: number) {
		this.countEffectsShaderPass += value;
		this.isShaderPass = this.countEffectsShaderPass > 0;
	}

	set CountEffectsImage(value: number) {
		this.countEffectsImage += value;
		this.isImage = this.countEffectsImage > 0;
	}
	//* -- end of SETTER

	private ObserverCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			const img = this.mapMeshImages.get(entry.target.id);

			if (!img) {
				console.warn("Did you add image to the scene via Image(setter)?");
				return;
			}
			if (!img.mesh) {
				throw new Error(`Unable to observe img, mesh is undefined`);
			}

			img.mesh.visible = entry.isIntersecting;
		});
	}

	//! Render
	private render() {
		this.time += 0.5;

		if (this.isShaderPass) {
			this.macawScroll.scrollSpeedRender();
		}

		if (this.shouldRender()) {
			this.manualRender();
		}

		window.requestAnimationFrame(this.render.bind(this));
	}

	private setUniforms({ image = false, shaderPass = false }) {
		if (image) {
			this.mapMeshImages.forEach((img) => {
				if (!img.material) throw new Error("Unable to set uniforms, material in undefined");
				img.material.uniforms.u_time.value = this.time;

				this.mapEffects.forEach((effect) => {
					if (effect.setImageUniforms) {
						effect.setImageUniforms(img);
					}
				});
			});
		}

		if (shaderPass) {
			this.macawComposer.shaderPass.uniforms.u_time.value = this.time;
		}
	}
}
