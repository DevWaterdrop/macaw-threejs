import { SCENE_DEFAULTS } from "./constants";
import { calculateCameraFov } from "./utils/calculate_camera_fov";
import type { MacawScene } from "./scene";

interface Props {
	scene: MacawScene;
}

export class MacawResize {
	private _scene: MacawScene;

	constructor(options: Props) {
		const { scene } = options;

		this._scene = scene;
	}

	resize() {
		this._scene.core.dimensions = {
			width: this._scene.core.container.offsetWidth,
			height: this._scene.core.container.offsetHeight
		};

		this._scene.core.camera.aspect =
			this._scene.core.dimensions.width / this._scene.core.dimensions.height;
		this._scene.core.camera.fov = calculateCameraFov(
			this._scene.core.dimensions.height,
			SCENE_DEFAULTS.positionZ
		);
		this._scene.core.camera.updateProjectionMatrix();

		this._scene.core.renderer.setSize(
			this._scene.core.dimensions.width,
			this._scene.core.dimensions.height
		);
		this._scene.macaws.composer.instance.setSize(
			this._scene.core.dimensions.width,
			this._scene.core.dimensions.height
		);

		this._scene.setImagesPosition({ resize: true });

		this._scene.storage.mapEffects.forEach((effect) => {
			if (effect.resize) effect.resize();
		});

		if (!this._scene.shouldRender()) {
			this._scene.manualRender();
		}
	}

	setup() {
		window.addEventListener("resize", this.resize.bind(this));
	}

	cleanUp() {
		window.removeEventListener("resize", this.resize.bind(this));
	}
}
