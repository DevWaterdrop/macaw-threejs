import type { SceneSettings, Dimensions } from "./Scene.types";
import * as THREE from "three";
import { MacawCore } from "../index";
import { SCENE_SETTINGS_DEFAULTS, SCENE_TYPE } from "../../constants";
import { initCamera, initRaycaster, initRenderer, initScene } from "../../inits";

interface Props {
	core: MacawCore;
	container: HTMLDivElement;
	settings: SceneSettings;
}

export class MacawScene {
	settings: Required<SceneSettings>;

	readonly container: HTMLDivElement;
	readonly dimensions: Dimensions;
	readonly scene: THREE.Scene;
	readonly camera: THREE.PerspectiveCamera;
	readonly renderer: THREE.WebGLRenderer;
	readonly raycaster: THREE.Raycaster;

	private _core: MacawCore;

	constructor(props: Props) {
		const { core, settings, container } = props;

		this._core = core;

		const { position } = window.getComputedStyle(container);
		const type = Object.keys(SCENE_TYPE).includes(position)
			? (position as SCENE_TYPE)
			: SCENE_TYPE.absolute;

		this.settings = {
			type,
			...SCENE_SETTINGS_DEFAULTS,
			...settings
		};

		this.dimensions = {
			width: container.offsetWidth,
			height: container.offsetHeight
		};

		this.container = container;
		this.scene = initScene({ settings: this.settings });
		this.camera = initCamera({ dimensions: this.dimensions });
		this.renderer = initRenderer({ container: this.container, settings: this.settings });
		this.raycaster = initRaycaster();
	}

	setSettings(sceneSettings: SceneSettings) {
		this._core.controllers.render.isManualShouldRender = false;

		// ? Change only changed 💁‍♂️
		this.scene.background = new THREE.Color(sceneSettings.color);

		this.settings = { ...this.settings, ...sceneSettings };
		this._core.controllers.render.manualRender();
	}
}
