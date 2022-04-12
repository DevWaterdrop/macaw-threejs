import type { MacawScene } from "../../scene";

export function manualRender(this: MacawScene) {
	const { isShaderPass } = this.renderOBJ;
	const { scrollTimes } = this.macawOBJ.scroll;
	const { scene, camera } = this.coreOBJ;

	// ? Maybe set uniforms only if at least one effect is enabled from previewSettings 🧐
	this.setUniforms({ image: true, shaderPass: isShaderPass });

	this.storageOBJ.mapEffects.forEach((effect) => {
		if (effect.manualRender) effect.manualRender();
	});

	// ? Find better performance solution
	if (isShaderPass) {
		if (scrollTimes <= 1) {
			this.coreOBJ.renderer.render(scene, camera); //! Temporarily fix
		}
		this.macawOBJ.composer.instance.render();
	} else {
		this.coreOBJ.renderer.render(scene, camera);
	}

	// ? Chaining 🤔
	// return this;
}
