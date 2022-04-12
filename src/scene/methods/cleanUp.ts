import type { MacawScene } from "../../scene";

export function cleanUp(this: MacawScene) {
	this.macawOBJ.resize.cleanUp();
	this.macawOBJ.scroll.cleanUp();
	this.macawOBJ.observer.cleanUp();
	this.storageOBJ.mapMeshImages.forEach((img) => {
		img.cleanUp();
	});
}
