import type { MacawCore } from "../index";
import type { Uniform } from "../../Effect";
import type { MacawComposerShader } from "../Shader/Composer";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

interface Props {
	core: MacawCore;
}

export class MacawComposer {
	shaderPass: ShaderPass;

	readonly instance: EffectComposer;
	readonly renderPass: RenderPass;

	private _core: MacawCore;

	constructor(props: Props) {
		const { core } = props;

		this._core = core;

		this.instance = new EffectComposer(this._core.scene.renderer);
		this.instance.setSize(this._core.scene.dimensions.width, this._core.scene.dimensions.height);

		this.renderPass = new RenderPass(this._core.scene.scene, this._core.scene.camera);
		this.instance.addPass(this.renderPass);

		this.shaderPass = new ShaderPass(this._core.controllers.shader.composer.shaderEffect);
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
