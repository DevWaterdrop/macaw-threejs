import type { MacawScene } from "../../scene";

export interface SetImagesPositionProps {
	resize?: boolean;
}

export function setImagesPosition(this: MacawScene, props: SetImagesPositionProps) {
	const { resize = false } = props;

	this.storageOBJ.mapMeshImages.forEach((img) => {
		img.setPosition(resize);
	});
}
