import { SCENE_DEFAULTS } from "./constants";
import { calculateCameraFov } from "./utils/calculate_camera_fov";
import type { MacawScene } from "./scene";

interface Props {
	scene: MacawScene;
}

export class MacawResize {
	private scene: MacawScene;

	constructor(options: Props) {
		const { scene } = options;

		this.scene = scene;
	}

	resize() {
		this.scene.dimensions = {
			width: this.scene.container.offsetWidth,
			height: this.scene.container.offsetHeight
		};

		this.scene.camera.aspect = this.scene.dimensions.width / this.scene.dimensions.height;
		this.scene.camera.fov = calculateCameraFov(
			this.scene.dimensions.height,
			SCENE_DEFAULTS.positionZ
		);
		this.scene.camera.updateProjectionMatrix();

		this.scene.renderer.setSize(this.scene.dimensions.width, this.scene.dimensions.height);
		this.scene.macawComposer.composer.setSize(
			this.scene.dimensions.width,
			this.scene.dimensions.height
		);

		this.scene.setImagesPosition(true);

		this.scene.mapEffects.forEach((effect) => {
			if (effect.resize) effect.resize();
		});

		if (!this.scene.shouldRender()) {
			this.scene.manualRender();
		}
	}

	setup() {
		window.addEventListener("resize", this.resize.bind(this));
	}

	cleanUp() {
		window.removeEventListener("resize", this.resize.bind(this));
	}
}
