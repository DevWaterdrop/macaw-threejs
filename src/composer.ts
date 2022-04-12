import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import type { Uniform } from "./effect";
import type { MacawScene } from "./scene";
import type { MacawComposerShader } from "./shaders/composerShader";

interface Props {
	scene: MacawScene;
}

export class MacawComposer {
	shaderPass: ShaderPass;
	scene: MacawScene;

	readonly instance: EffectComposer;
	readonly renderPass: RenderPass;

	constructor(options: Props) {
		const { scene } = options;

		this.scene = scene;

		this.instance = new EffectComposer(this.scene.coreOBJ.renderer);
		this.instance.setSize(
			this.scene.coreOBJ.dimensions.width,
			this.scene.coreOBJ.dimensions.height
		);

		this.renderPass = new RenderPass(this.scene.coreOBJ.scene, this.scene.coreOBJ.camera);
		this.instance.addPass(this.renderPass);

		this.shaderPass = new ShaderPass(this.scene.composerOBJ.shaderEffect);
		this.shaderPass.renderToScreen = true;
		this.instance.addPass(this.shaderPass);
	}

	refreshShaderPass(shader: MacawComposerShader, additionalUniforms: Uniform = {}) {
		const { uniforms, vertexShader, fragmentShader } = shader;

		this.instance.removePass(this.shaderPass);

		this.shaderPass = new ShaderPass({
			uniforms: { ...additionalUniforms, ...uniforms },
			vertexShader,
			fragmentShader
		});
		this.shaderPass.renderToScreen = true;

		this.instance.addPass(this.shaderPass);
	}
}
