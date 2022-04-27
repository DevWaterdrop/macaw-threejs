import type { Effect } from "../Effect";
import type { MacawImage } from "../Image";
import type { EffectController } from "../controllers/Effect";
import type { RenderController } from "../controllers/Render";
import type { GeneralController } from "../controllers/General";
import type { ShaderController } from "../controllers/Shader";

type MeshImages = Map<string, MacawImage>;
export type Effects = Map<string, Effect>;

export type Storage = {
	readonly meshImages: MeshImages;
	readonly effects: Effects;
	readonly images: HTMLImageElement[];
};

export type Utils = {
	readonly vector2: THREE.Vector2;
};

export type Controllers = {
	readonly effect: EffectController;
	readonly render: RenderController;
	readonly general: GeneralController;
	readonly shader: ShaderController;
};
