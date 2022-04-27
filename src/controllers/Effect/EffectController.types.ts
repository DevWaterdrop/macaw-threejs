import type { Effect } from "../../Effect";

export interface AddEffectProps {
	key: string;
	effect: Effect;
}

export interface RemoveEffectProps {
	key: string;
}
