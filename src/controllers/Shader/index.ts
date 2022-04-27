import type { Image, Composer } from "./Shader.types";
import { initComposer, initImage } from "../../inits";

export class ShaderController {
	readonly image: Image;
	readonly composer: Composer;

	constructor() {
		this.image = initImage();
		this.composer = initComposer();
	}
}
