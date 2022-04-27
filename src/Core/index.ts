import type { Storage, Controllers, Utils } from "./Core.types";
import type { SceneSettings } from "./Scene/Scene.types";
import * as THREE from "three";
import { MacawComposer } from "./Composer";
import { MacawObserver } from "./Observer";
import { MacawResize } from "./Resize";
import { MacawScene } from "./Scene";
import { MacawScroll } from "./Scroll";
import { STORAGE_DEFAULTS } from "../constants";
import { RenderController } from "../controllers/Render";
import { EffectController } from "../controllers/Effect";
import { GeneralController } from "../controllers/General";
import { ShaderController } from "../controllers/Shader";

interface Props {
	container: HTMLDivElement;
	sceneSettings: SceneSettings;
}

export class MacawCore {
	readonly storage: Storage;
	readonly scene: MacawScene;
	readonly composer: MacawComposer;
	readonly scroll: MacawScroll;
	readonly resize: MacawResize;
	readonly observer: MacawObserver;
	readonly controllers: Controllers;
	readonly utils: Utils;

	//* Quick Access
	readonly addEffect: EffectController["addEffect"];
	readonly removeEffect: EffectController["removeEffect"];

	constructor(props: Props) {
		const { sceneSettings, container } = props;

		this.storage = STORAGE_DEFAULTS;
		this.utils = {
			vector2: new THREE.Vector2()
		};
		this.scene = new MacawScene({ settings: sceneSettings, container: container, core: this });
		this.scroll = new MacawScroll({ core: this });
		this.resize = new MacawResize({ core: this });
		this.observer = new MacawObserver({ core: this });
		this.controllers = {
			effect: new EffectController({ core: this }),
			render: new RenderController({ core: this }),
			general: new GeneralController({ core: this }),
			shader: new ShaderController()
		};
		this.composer = new MacawComposer({ core: this });

		//* Quick Access
		const { addEffect, removeEffect } = this.controllers.effect;

		this.addEffect = addEffect.bind(this.controllers.effect);
		this.removeEffect = removeEffect.bind(this.controllers.effect);
		//* --- end of Quick Access

		this._init();
	}

	cleanUp() {
		this.resize.cleanUp();
		this.scroll.cleanUp();
		this.observer.cleanUp();

		this.storage.meshImages.forEach((img) => {
			img.cleanUp();
		});
	}

	private _init() {
		this.scroll.scroll();
		this.resize.resize();

		this.scroll.setupScroll();
		this.resize.setup();

		this.controllers.render.render();
		this.controllers.render.manualRender();
	}
}
