import type { MacawScene } from "../../scene";

export interface RemoveEffectProps {
	key: string;
}

export function removeEffect(this: MacawScene, props: RemoveEffectProps) {
	const { key } = props;

	if (!this.storage.mapEffects.has(key)) return false;

	const effect = { ...this.storage.mapEffects.get(key) };
	this.storage.mapEffects.delete(key);

	if (effect.composerFragmentString !== undefined) {
		this.CountEffectsShaderPass = -1;

		this.composer.shader.create(this.storage.mapEffects);
		this.macaws.composer.refreshShaderPass(this.composer.shader);
	}
	if (effect.imageFragmentString !== undefined) {
		this.CountEffectsImage = -1;

		this.image.shader.create(this.storage.mapEffects);
		this.storage.mapMeshImages.forEach((img) => img.refreshMaterial());
	}

	// ? Secure, maybe redundant render.
	if (!this.shouldRender()) {
		this.manualRender();
	}

	return true;
}
