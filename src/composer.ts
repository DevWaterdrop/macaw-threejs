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

	readonly instance: EffectComposer;
	readonly renderPass: RenderPass;

	private _scene: MacawScene;

	constructor(options: Props) {
		const { scene } = options;

		this._scene = scene;

		this.instance = new EffectComposer(this._scene.core.renderer);
		this.instance.setSize(this._scene.core.dimensions.width, this._scene.core.dimensions.height);

		this.renderPass = new RenderPass(this._scene.core.scene, this._scene.core.camera);
		this.instance.addPass(this.renderPass);

		this.shaderPass = new ShaderPass(this._scene.composer.shaderEffect);
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
