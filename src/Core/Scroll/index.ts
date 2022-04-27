import type { MacawCore } from "../index";
import type { ScrollSpeed } from "./Scroll.types";
import { SCENE_TYPE } from "../../constants";
import { lerp } from "../../utils/lerp";

interface Props {
	core: MacawCore;
}

export class MacawScroll {
	currentScroll: number;
	scrollTimes: number;
	scrollSpeed: ScrollSpeed;

	private _core: MacawCore;

	constructor(props: Props) {
		const { core } = props;

		this._core = core;

		// Init
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;
		this.scrollTimes = 0;
		this.scrollSpeed = {
			speed: 0,
			target: 0,
			render: 0
		};
	}

	scrollSpeedRender() {
		/* scrollTimes > 1 => removes "first" animation if scroll position > 0,
				cannot be seen in the generator because all scroll animation by default are disabled */
		if (this.scrollTimes > 1) {
			this.scrollSpeed.speed =
				Math.min(Math.abs(this.currentScroll - this.scrollSpeed.render), 200) / 200;

			this.scrollSpeed.target += (this.scrollSpeed.speed - this.scrollSpeed.target) * 0.2;
			this.scrollSpeed.render = lerp(this.scrollSpeed.render, this.currentScroll, 0.1);
		}

		this._core.composer.shaderPass.uniforms.scrollSpeed.value = this.scrollSpeed.target; // ? Maybe move to setUniforms

		this._core.controllers.render.isManualShouldRender =
			this._core.controllers.render.countClickRender > 0 || this.scrollSpeed.speed > 0.01;
	}

	scroll() {
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;
		this.scrollTimes += 1;

		if (this._core.scene.settings.type === SCENE_TYPE.fixed) {
			this._core.scene.camera.position.setY(-this.currentScroll);
		}

		this._core.storage.effects.forEach((effect) => {
			if (effect.scroll) effect.scroll();
		});

		/* this.scrollTimes <= 2 => Sometimes wrong dimension of scene container, 
				this may help to avoid that. */
		if (this.scrollTimes <= 2) {
			this._core.resize.resize();
		} else {
			this._core.controllers.render.manualRender();
		}
	}

	setupScroll() {
		window.addEventListener("scroll", this.scroll.bind(this));
	}

	cleanUp() {
		window.removeEventListener("scroll", this.scroll.bind(this));
	}
}
