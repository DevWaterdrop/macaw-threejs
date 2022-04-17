import type { MacawScene } from "../../scene";

export function cleanUp(this: MacawScene) {
	this.macaws.resize.cleanUp();
	this.macaws.scroll.cleanUp();
	this.macaws.observer.cleanUp();
	this.storage.mapMeshImages.forEach((img) => {
		img.cleanUp();
	});
}
