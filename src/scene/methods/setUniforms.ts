import type { MacawScene } from "../../scene";

export interface SetUniformsProps {
	image: boolean;
	shaderPass: boolean;
}

export function setUniforms(this: MacawScene, props: SetUniformsProps) {
	const { image = false, shaderPass = false } = props;

	if (image) {
		this.storageOBJ.mapMeshImages.forEach((img) => {
			img.setUniforms();
		});
	}

	if (shaderPass) {
		this.macawOBJ.composer.shaderPass.uniforms.u_time.value = this.time;
	}
}
