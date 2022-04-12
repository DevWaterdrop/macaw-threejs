import type { MacawScene } from "../../scene";

export function shouldRender(this: MacawScene) {
	if (this.renderOBJ.isManualShouldRender) return true;
	return false;
}
