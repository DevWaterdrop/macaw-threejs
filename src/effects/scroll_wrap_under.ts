import type { FragmentString } from "../effect";
import { Effect } from "../effect";

export class ScrollWrapUnder extends Effect {
	readonly composerFragmentString: FragmentString;

	constructor() {
		super();

		this.composerFragmentString = {
			beforeGl_FragColor: /*glsl*/ `
				float areaSWU = smoothstep(0.4,0.,vUv.y);
				areaSWU = pow(areaSWU,4.);
		
				newUV.x -= (vUv.x - 0.5)*0.1*areaSWU*scrollSpeed;
			`
		};
	}
}
