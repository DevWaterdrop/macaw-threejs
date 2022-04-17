import type { MacawScene } from "../../scene";

export function manualRender(this: MacawScene) {
	const { isShaderPass } = this.render;
	const { scene, camera } = this.core;

	// ? Maybe set uniforms only if at least one effect is enabled from previewSettings 🧐
	this.setUniforms({ image: true, shaderPass: isShaderPass });

	this.storage.mapEffects.forEach((effect) => {
		if (effect.manualRender) effect.manualRender();
	});

	if (isShaderPass) {
		// ? Currently removed, may cause bugs!
		// const { scrollTimes } = this.macawOBJ.scroll; // Line 4-5
		// if (scrollTimes <= 1) {
		// 	this.coreOBJ.renderer.render(scene, camera);
		// }
		this.macaws.composer.instance.render();
	} else {
		this.core.renderer.render(scene, camera);
	}
}
