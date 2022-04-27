import type * as THREE from "three";
import type { MacawImageShader } from "../../Core/Shader/Image";
import type { MacawComposerShader } from "../../Core/Shader/Composer";
import type { Uniform } from "../../Effect";

export type Image = {
	shader: MacawImageShader;
	baseMaterial: THREE.ShaderMaterial;
};

export type Composer = {
	shader: MacawComposerShader;
	shaderEffect: {
		uniforms: Uniform;
		fragmentShader: string;
		vertexShader: string;
	};
};
