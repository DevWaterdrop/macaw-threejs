import type { EffectComposerUniforms, FragmentString, Uniform, VertexString } from "../effect";
import { Effect } from "../effect";

export class ScrollWrapUnder extends Effect implements EffectComposerUniforms {
	readonly composerFragmentString: FragmentString;
	readonly composerVertexString!: VertexString; // TODO TEMPFIX !
	readonly composerUniforms!: Uniform; // TODO TEMPFIX !

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
