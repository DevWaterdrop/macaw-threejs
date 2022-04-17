import type { MacawScene } from "../../scene";

export function shouldRender(this: MacawScene) {
	if (this.render.isManualShouldRender) return true;
	return false;
}
