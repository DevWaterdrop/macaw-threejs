import * as THREE from "three";
import type { MacawImage } from "./image";
import { MacawComposer } from "./composer";
import type { GeneralEffect } from "./effect";
import { MacawImageShader } from "./shaders/imageShader";
import { MacawComposerShader } from "./shaders/composerShader";
import { lerp } from "./utils/lerp";

interface Props {
	container: HTMLDivElement;
	sceneSettings: SceneSettings;
}

type ScrollSpeed = {
	speed: number;
	target: number;
	render: number;
};

export type SceneSettings = {
	alpha: boolean;
	color: number;
	maxDPR?: number;
};

type MapMeshImages = Map<string, MacawImage>;
export type MapEffects = Map<string, GeneralEffect>;

export class MacawScene {
	manualShouldRender: boolean;
	observer: IntersectionObserver;
	settings: SceneSettings;
	clickRender: number;
	dimensions: { width: number; height: number };
	currentScroll: number;
	shaderEffect: Record<string, unknown>;

	countEffectsShaderPass: number;
	countEffectsImage: number;
	isShaderPass: boolean;
	isImage: boolean;

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
	private scrollSpeed: ScrollSpeed;
	private scrollTimes: number;
	private macawComposer: MacawComposer;

	constructor(options: Props) {
		this.container = options.container;
		this.settings = options.sceneSettings;

		//* Default settings
		// scroll
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;
		this.scrollTimes = 0;
		this.time = 0;
		this.scrollSpeed = {
			speed: 0,
			target: 0,
			render: 0
		};
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
		//* -- end of Default settings

		this.dimensions = {
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		};

		this.scene = new THREE.Scene();
		if (!this.settings.alpha) {
			this.scene.background = new THREE.Color(this.settings.color);
		}

		const near = 70;
		const far = 2000;

		this.camera = new THREE.PerspectiveCamera(
			70,
			this.dimensions.width / this.dimensions.height,
			near,
			far
		);
		this.camera.position.z = 600;
		this.camera.position.y = -this.currentScroll;
		this.camera.fov =
			2 * Math.atan(this.dimensions.height / 2 / this.camera.position.z) * (180 / Math.PI);

		this.renderer = new THREE.WebGLRenderer({
			powerPreference: "high-performance",
			alpha: this.settings.alpha
		});

		this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.settings.maxDPR ?? 1.75));
		this.container.appendChild(this.renderer.domElement);

		this.raycaster = new THREE.Raycaster();
		this.raycaster.near = near;
		this.raycaster.far = far;

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
		this.scroll();
		this.resize();

		this.setupScroll();
		this.setupResize();

		this.render();
		this.manualRender();
	}

	// TODO Same code in removeEffect
	addEffect(key: string, effect: GeneralEffect) {
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
			if (this.scrollTimes <= 1) this.renderer.render(this.scene, this.camera); //! Temporarily fix
			this.macawComposer.composer.render();
		} else {
			this.renderer.render(this.scene, this.camera);
		}
	}

	cleanUp() {
		window.removeEventListener("resize", this.resize.bind(this));
		window.removeEventListener("scroll", this.scroll.bind(this));
		this.mapMeshImages.forEach((img) => {
			img.cleanUp();
		});
		this.observer.disconnect();
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

	private setupResize() {
		window.addEventListener("resize", this.resize.bind(this));
	}

	private setupScroll() {
		window.addEventListener("scroll", this.scroll.bind(this));
	}

	private ObserverCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			const img = this.mapMeshImages.get(entry.target.id);

			if (!img || !img.mesh) {
				throw new Error(`Unable observe img, img or mesh is undefined`);
			}
			img.mesh.visible = entry.isIntersecting;
		});
	}

	private scrollSpeedRender() {
		/* scrollTimes > 1 => removes "first" animation if scroll position > 0,
				cannot be seen in the generator because all scroll animation by default are disabled */
		if (this.scrollTimes > 1) {
			// TODO Find better approach (without if)
			this.scrollSpeed.speed =
				Math.min(Math.abs(this.currentScroll - this.scrollSpeed.render), 200) / 200;

			this.scrollSpeed.target += (this.scrollSpeed.speed - this.scrollSpeed.target) * 0.2;
			this.scrollSpeed.render = lerp(this.scrollSpeed.render, this.currentScroll, 0.1);
		}

		this.macawComposer.shaderPass.uniforms.scrollSpeed.value = this.scrollSpeed.target; // ? Maybe move to setUniforms

		// TODO WIP
		// ? Maybe make it 0.01/0.1 for performance
		this.manualShouldRender = this.clickRender > 0 || this.scrollSpeed.speed > 0.01;
	}

	private scroll() {
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;

		this.camera.position.setY(-this.currentScroll);

		this.scrollTimes += 1;
		//? Currently removed for better performance, it seems there is no need, and there are no bugs
		//? UPDATE: Bugs on resize, WIP to remove it
		// TODO performance => need to remove
		this.setImagesPosition();

		this.mapEffects.forEach((effect) => {
			if (effect.scroll) effect.scroll();
		});

		if (!this.shouldRender()) {
			this.manualRender();
		}
	}

	private resize() {
		this.dimensions = {
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		};

		this.camera.aspect = this.dimensions.width / this.dimensions.height;
		this.camera.fov = 2 * Math.atan(this.dimensions.height / 2 / 600) * (180 / Math.PI);
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.dimensions.width, this.dimensions.height);
		this.macawComposer.composer.setSize(this.dimensions.width, this.dimensions.height);

		this.setImagesPosition(true);

		this.mapEffects.forEach((effect) => {
			if (effect.resize) effect.resize();
		});

		if (!this.shouldRender()) {
			this.manualRender();
		}
	}

	private shouldRender() {
		if (this.manualShouldRender) return true;
		return false;
	}

	//! Render
	private render() {
		this.time += 0.5;

		if (this.isShaderPass) {
			this.scrollSpeedRender();
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

	private setImagesPosition(resize = false) {
		this.mapMeshImages.forEach((img) => {
			img.setPosition(resize);
		});
	}
}
