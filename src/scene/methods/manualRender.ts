import type { MacawScene } from "../../scene";

export function manualRender(this: MacawScene) {
	const { isShaderPass } = this.renderOBJ;
	const { scene, camera } = this.coreOBJ;

	// ? Maybe set uniforms only if at least one effect is enabled from previewSettings 🧐
	this.setUniforms({ image: true, shaderPass: isShaderPass });

	this.storageOBJ.mapEffects.forEach((effect) => {
		if (effect.manualRender) effect.manualRender();
	});

	if (isShaderPass) {
		// ? Currently removed, may cause bugs!
		// const { scrollTimes } = this.macawOBJ.scroll; // Line 4-5
		// if (scrollTimes <= 1) {
		// 	this.coreOBJ.renderer.render(scene, camera);
		// }
		this.macawOBJ.composer.instance.render();
	} else {
		this.coreOBJ.renderer.render(scene, camera);
	}
}
