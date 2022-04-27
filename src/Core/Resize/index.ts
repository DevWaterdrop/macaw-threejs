import type { MacawCore } from "../index";
import { SCENE_DEFAULTS } from "../../constants";
import { calculateCameraFov } from "../../utils/calculate_camera_fov";

interface Props {
	core: MacawCore;
}

export class MacawResize {
	private _core: MacawCore;

	constructor(props: Props) {
		const { core } = props;

		this._core = core;
	}

	resize() {
		this._core.scene.dimensions.width = this._core.scene.container.offsetWidth;
		this._core.scene.dimensions.height = this._core.scene.container.offsetHeight;

		this._core.scene.camera.aspect =
			this._core.scene.dimensions.width / this._core.scene.dimensions.height;

		this._core.scene.camera.fov = calculateCameraFov(
			this._core.scene.dimensions.height,
			SCENE_DEFAULTS.positionZ
		);
		this._core.scene.camera.updateProjectionMatrix();

		this._core.scene.renderer.setSize(
			this._core.scene.dimensions.width,
			this._core.scene.dimensions.height
		);
		this._core.composer.instance.setSize(
			this._core.scene.dimensions.width,
			this._core.scene.dimensions.height
		);

		this._core.controllers.general.setImagesPosition({ resize: true });

		this._core.storage.effects.forEach((effect) => {
			if (effect.resize) effect.resize();
		});

		if (!this._core.controllers.render.shouldRender()) {
			this._core.controllers.render.manualRender();
		}
	}

	setup() {
		window.addEventListener("resize", this.resize.bind(this));
	}

	cleanUp() {
		window.removeEventListener("resize", this.resize.bind(this));
	}
}
