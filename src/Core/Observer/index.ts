import type { MacawCore } from "../index";

interface Props {
	core: MacawCore;
}

export class MacawObserver {
	instance: IntersectionObserver;

	private _core: MacawCore;

	constructor(props: Props) {
		const { core } = props;

		this._core = core;
		this.instance = new IntersectionObserver(this._callback.bind(this));
	}

	cleanUp() {
		this.instance.disconnect();
	}

	private _callback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			const img = this._core.storage.meshImages.get(entry.target.id);

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
