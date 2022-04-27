import { RENDER_TIME } from "../../constants";
import type { MacawCore } from "../../Core";

interface Props {
	core: MacawCore;
}

export class RenderController {
	time: number;
	isShaderPass: boolean;
	isImage: boolean;
	isManualShouldRender: boolean;
	countClickRender: number;

	private _core: MacawCore;

	constructor(props: Props) {
		const { core } = props;

		this._core = core;

		this.time = 0;
		this.isShaderPass = false;
		this.isImage = false;
		this.isManualShouldRender = false;
		this.countClickRender = 0;
	}

	render() {
		this.time += RENDER_TIME;

		if (this.isShaderPass) {
			this._core.scroll.scrollSpeedRender();
		}

		if (this.shouldRender()) {
			this.manualRender();
		}

		window.requestAnimationFrame(this.render.bind(this));
	}

	manualRender() {
		const { scene, camera } = this._core.scene;

		// ? Maybe set uniforms only if at least one effect is enabled from previewSettings 🧐
		this._core.controllers.general.setUniforms({ image: true, shaderPass: this.isShaderPass });

		this._core.storage.effects.forEach((effect) => {
			if (effect.manualRender) effect.manualRender();
		});

		if (this.isShaderPass) {
			// ? Currently removed, may cause bugs!
			// const { scrollTimes } = this.macawOBJ.scroll; // Line 4-5
			// if (scrollTimes <= 1) {
			// 	this.coreOBJ.renderer.render(scene, camera);
			// }
			this._core.composer.instance.render();
		} else {
			this._core.scene.renderer.render(scene, camera);
		}
	}

	shouldRender() {
		if (this.isManualShouldRender) return true;
		return false;
	}
}
