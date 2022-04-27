import { SCENE_TYPE } from "../constants";
import { Effect } from "../Effect";

export class ScrollWrapUnder extends Effect {
	constructor() {
		super();

		const type = new Set<SCENE_TYPE>();
		type.add(SCENE_TYPE.fixed);
		this.type = type;

		this.composerFragmentString = {
			beforeGl_FragColor: /*glsl*/ `
				float areaSWU = smoothstep(0.4,0.,vUv.y);
				areaSWU = pow(areaSWU,4.);
		
				newUV.x -= (vUv.x - 0.5)*0.1*areaSWU*scrollSpeed;
			`
		};
	}
}
