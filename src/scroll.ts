import { SCENE_TYPE } from "./constants";
import type { MacawScene } from "./scene";
import { lerp } from "./utils/lerp";

interface Props {
	scene: MacawScene;
}

type ScrollSpeed = {
	speed: number;
	target: number;
	render: number;
};

export class MacawScroll {
	currentScroll: number;
	scrollTimes: number;
	scrollSpeed: ScrollSpeed;

	private scene: MacawScene;

	constructor(options: Props) {
		const { scene } = options;

		this.scene = scene;

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
			// TODO Find better approach (without if)
			this.scrollSpeed.speed =
				Math.min(Math.abs(this.currentScroll - this.scrollSpeed.render), 200) / 200;

			this.scrollSpeed.target += (this.scrollSpeed.speed - this.scrollSpeed.target) * 0.2;
			this.scrollSpeed.render = lerp(this.scrollSpeed.render, this.currentScroll, 0.1);
		}

		this.scene.macawComposer.shaderPass.uniforms.scrollSpeed.value = this.scrollSpeed.target; // ? Maybe move to setUniforms

		// TODO WIP
		// ? Maybe make it 0.01/0.1 for performance
		this.scene.manualShouldRender = this.scene.clickRender > 0 || this.scrollSpeed.speed > 0.01;
	}

	scroll() {
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;
		this.scrollTimes += 1;

		if (this.scene.type === SCENE_TYPE.fixed) {
			this.scene.camera.position.setY(-this.currentScroll);
			//? Currently removed for better performance, it seems there is no need, and there are no bugs
			//? UPDATE: Bugs on resize, WIP to remove it
			// TODO performance => need to remove
			this.scene.setImagesPosition();
		}

		this.scene.mapEffects.forEach((effect) => {
			if (effect.scroll) effect.scroll();
		});

		if (!this.scene.shouldRender()) {
			this.scene.manualRender();
		}
	}

	setupScroll() {
		window.addEventListener("scroll", this.scroll.bind(this));
	}

	cleanUp() {
		window.removeEventListener("scroll", this.scroll.bind(this));
	}
}
