import type { MacawScene } from "./scene";

interface Props {
	scene: MacawScene;
}

export class MacawObserver {
	instance: IntersectionObserver;
	private _scene: MacawScene;

	constructor(options: Props) {
		const { scene } = options;

		this._scene = scene;
		this.instance = new IntersectionObserver(this._callback.bind(this));
	}

	cleanUp() {
		this.instance.disconnect();
	}

	private _callback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			const img = this._scene.storage.mapMeshImages.get(entry.target.id);

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
