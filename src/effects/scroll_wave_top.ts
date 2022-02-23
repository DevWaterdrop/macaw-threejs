import type { EffectComposerUniforms, FragmentString } from "../effect";
import { Effect } from "../effect";

export class ScrollWaveTop extends Effect implements EffectComposerUniforms {
	readonly composerFragmentString: FragmentString;

	constructor() {
		super();

		// TODO Remove return, find better approach
		this.composerFragmentString = {
			afterGl_FragColor: /*glsl*/ `
				float areaSWT = smoothstep(1.,0.8,vUv.y)*2.-1.;
				float preNoiseSWT = 0.5*(cnoise(vec3(vUv*5.,u_time*0.075))+1.);
				float noiseSWT = smoothstep(0.5,0.51,preNoiseSWT+areaSWT);
		
				gl_FragColor = mix(vec4(0.),texture2D(tDiffuse, newUV),noiseSWT);
				return;
			`
		};
	}
}