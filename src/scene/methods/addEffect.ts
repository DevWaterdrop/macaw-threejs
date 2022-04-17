import type { GeneralEffect } from "../../effect";
import type { MacawScene } from "../../scene";

export interface AddEffectProps {
	key: string;
	effect: GeneralEffect;
}

export function addEffect(this: MacawScene, props: AddEffectProps) {
	const { key, effect } = props;

	if (!effect.type?.has(this.settings.type)) {
		throw new Error(`This effect doesn't support ${this.settings.type} type!`);
	}

	if (this.storage.mapEffects.has(key)) {
		this.removeEffect({ key });
		return false;
	}

	effect.scene = this;
	this.storage.mapEffects.set(key, effect);

	if (effect.composerFragmentString !== undefined) {
		this.CountEffectsShaderPass = 1;

		this.composer.shader.create(this.storage.mapEffects);
		this.macaws.composer.refreshShaderPass(this.composer.shader, effect.composerUniforms);
	}
	if (effect.imageFragmentString !== undefined) {
		this.CountEffectsImage = 1;

		this.image.shader.create(this.storage.mapEffects);
		this.storage.mapMeshImages.forEach((img) => {
			img.refreshMaterial(effect.imageUniforms);
		});
	}

	// ? Secure, maybe redundant render.
	if (!this.shouldRender()) {
		this.manualRender();
	}

	return true;
}
