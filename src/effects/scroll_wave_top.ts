import { SCENE_TYPE } from "../constants";
import { Effect } from "../effect";

export class ScrollWaveTop extends Effect {
	constructor() {
		super();

		const type = new Set<SCENE_TYPE>();
		type.add(SCENE_TYPE.fixed);
		this.type = type;

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
