import type { GeneralEffect } from "../../effect";
import type { MacawScene } from "../../scene";

export interface AddEffectProps {
	key: string;
	effect: GeneralEffect;
}

// TODO Same code in removeEffect
export function addEffect(this: MacawScene, props: AddEffectProps) {
	const { key, effect } = props;

	if (!effect.type?.has(this.settings.type)) {
		throw new Error(`This effect doesn't support ${this.settings.type} type!`);
	}

	if (this.storageOBJ.mapEffects.has(key)) {
		this.removeEffect({ key });
		return false;
	}

	effect.scene = this;
	this.storageOBJ.mapEffects.set(key, effect);

	if (effect.composerFragmentString !== undefined) {
		this.CountEffectsShaderPass = 1;

		this.composerOBJ.shader.create(this.storageOBJ.mapEffects);
		this.macawOBJ.composer.refreshShaderPass(this.composerOBJ.shader, effect.composerUniforms);
	}
	if (effect.imageFragmentString !== undefined) {
		this.CountEffectsImage = 1;

		this.imageOBJ.shader.create(this.storageOBJ.mapEffects);
		this.storageOBJ.mapMeshImages.forEach((img) => {
			img.refreshMaterial(effect.imageUniforms);
		});
	}

	this.manualRender(); // TODO maybe remove

	return true;
}
