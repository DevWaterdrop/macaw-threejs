import type { SetUniformsProps, SetImagesPositionProps } from "./GeneralController.types";
import type { MacawCore } from "../../Core";

interface Props {
	core: MacawCore;
}

export class GeneralController {
	private _core: MacawCore;

	constructor(props: Props) {
		const { core } = props;

		this._core = core;
	}

	setUniforms(props: SetUniformsProps) {
		const { image = false, shaderPass = false } = props;

		if (image) {
			this._core.storage.meshImages.forEach((img) => {
				img.setUniforms();
			});
		}

		if (shaderPass) {
			const { time } = this._core.controllers.render;

			this._core.composer.shaderPass.uniforms.u_time.value = time;
		}
	}

	setImagesPosition(props: SetImagesPositionProps) {
		const { resize = false } = props;

		this._core.storage.meshImages.forEach((img) => {
			img.setPosition(resize);
		});
	}
}
