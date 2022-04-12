import type { MacawScene } from "./scene";

interface Props {
	scene: MacawScene;
}

export class MacawObserver {
	scene: MacawScene;
	instance: IntersectionObserver;

	constructor(options: Props) {
		const { scene } = options;

		this.scene = scene;
		this.instance = new IntersectionObserver(this.callback.bind(this));
	}

	cleanUp() {
		this.instance.disconnect();
	}

	private callback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			const img = this.scene.storageOBJ.mapMeshImages.get(entry.target.id);

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
}
