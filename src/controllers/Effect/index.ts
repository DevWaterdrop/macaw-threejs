import type { AddEffectProps, RemoveEffectProps } from "./EffectController.types";
import type { MacawCore } from "../../Core";

interface Props {
	core: MacawCore;
}

export class EffectController {
	countEffectsShaderPass = 0;
	countEffectsImage = 0;

	private _core: MacawCore;

	constructor(props: Props) {
		const { core } = props;

		this._core = core;
	}

	addEffect(props: AddEffectProps) {
		const { key, effect } = props;

		if (!effect.type?.has(this._core.scene.settings.type)) {
			throw new Error(`This effect doesn't support ${this._core.scene.settings.type} type!`);
		}

		if (this._core.storage.effects.has(key)) {
			this.removeEffect({ key });
			return false;
		}

		effect.core = this._core;
		this._core.storage.effects.set(key, effect);

		if (effect.composerFragmentString !== undefined) {
			this.setCountEffectsShaderPass(1);

			this._core.controllers.shader.composer.shader.create(this._core.storage.effects);
			this._core.composer.refreshShaderPass(
				this._core.controllers.shader.composer.shader,
				effect.composerUniforms
			);
		}
		if (effect.imageFragmentString !== undefined) {
			this.setCountEffectsImage(1);

			this._core.controllers.shader.image.shader.create(this._core.storage.effects);
			this._core.storage.meshImages.forEach((img) => {
				img.refreshMaterial(effect.imageUniforms);
			});
		}

		// ? Secure, maybe redundant render.
		if (!this._core.controllers.render.shouldRender()) {
			this._core.controllers.render.manualRender();
		}

		return true;
	}

	removeEffect(props: RemoveEffectProps) {
		const { key } = props;

		if (!this._core.storage.effects.has(key)) return false;

		const effect = { ...this._core.storage.effects.get(key) };
		this._core.storage.effects.delete(key);

		if (effect.composerFragmentString !== undefined) {
			this.setCountEffectsShaderPass(-1);

			this._core.controllers.shader.composer.shader.create(this._core.storage.effects);
			this._core.composer.refreshShaderPass(this._core.controllers.shader.composer.shader);
		}
		if (effect.imageFragmentString !== undefined) {
			this.setCountEffectsImage(-1);

			this._core.controllers.shader.image.shader.create(this._core.storage.effects);
			this._core.storage.meshImages.forEach((img) => img.refreshMaterial());
		}

		// ? Secure, maybe redundant render.
		if (!this._core.controllers.render.shouldRender()) {
			this._core.controllers.render.manualRender();
		}

		return true;
	}

	setCountEffectsShaderPass(value = 1) {
		this.countEffectsShaderPass += value;
		this._core.controllers.render.isShaderPass = this.countEffectsShaderPass > 0;
	}

	setCountEffectsImage(value: number) {
		this.countEffectsImage += value;
		this._core.controllers.render.isImage = this.countEffectsImage > 0;
	}
}
