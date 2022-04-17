import type { MacawScene } from "../../scene";

export interface RemoveEffectProps {
	key: string;
}

export function removeEffect(this: MacawScene, props: RemoveEffectProps) {
	const { key } = props;

	if (!this.storageOBJ.mapEffects.has(key)) return false;

	const effect = { ...this.storageOBJ.mapEffects.get(key) };
	this.storageOBJ.mapEffects.delete(key);

	if (effect.composerFragmentString !== undefined) {
		this.CountEffectsShaderPass = -1;

		this.composerOBJ.shader.create(this.storageOBJ.mapEffects);
		this.macawOBJ.composer.refreshShaderPass(this.composerOBJ.shader);
	}
	if (effect.imageFragmentString !== undefined) {
		this.CountEffectsImage = -1;

		this.imageOBJ.shader.create(this.storageOBJ.mapEffects);
		this.storageOBJ.mapMeshImages.forEach((img) => img.refreshMaterial());
	}

	// ? Secure, maybe redundant render.
	if (!this.shouldRender()) {
		this.manualRender();
	}

	return true;
}
