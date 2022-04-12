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
		this.scene.coreOBJ.dimensions = {
			width: this.scene.coreOBJ.container.offsetWidth,
			height: this.scene.coreOBJ.container.offsetHeight
		};

		this.scene.coreOBJ.camera.aspect =
			this.scene.coreOBJ.dimensions.width / this.scene.coreOBJ.dimensions.height;
		this.scene.coreOBJ.camera.fov = calculateCameraFov(
			this.scene.coreOBJ.dimensions.height,
			SCENE_DEFAULTS.positionZ
		);
		this.scene.coreOBJ.camera.updateProjectionMatrix();

		this.scene.coreOBJ.renderer.setSize(
			this.scene.coreOBJ.dimensions.width,
			this.scene.coreOBJ.dimensions.height
		);
		this.scene.macawOBJ.composer.instance.setSize(
			this.scene.coreOBJ.dimensions.width,
			this.scene.coreOBJ.dimensions.height
		);

		this.scene.setImagesPosition({ resize: true });

		this.scene.storageOBJ.mapEffects.forEach((effect) => {
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
