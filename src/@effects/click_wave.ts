import anime from "animejs";
import { SCENE_TYPE } from "../constants";
import { Effect } from "../Effect";
import type { MacawImage } from "../Image";

type Settings = {
	strength: number;
};

export class ClickWave extends Effect {
	constructor(options: Settings) {
		super();

		// Default Settings
		this.settings = options;

		const type = new Set<SCENE_TYPE>();
		type.add(SCENE_TYPE.fixed);
		type.add(SCENE_TYPE.absolute);
		this.type = type;

		this.imageFragmentString = {
			varying: /*glsl*/ `
				varying float vNoise;
			`,
			afterGl_FragColor: /*glsl*/ `
				gl_FragColor.rgb += 0.05*vec3(vNoise);
			`
		};
		this.imageVertexString = {
			struct: /*glsl*/ `
				struct ClickWave {
					float strength;
				};
			`,
			uniforms: /*glsl*/ `
				uniform ClickWave u_clickWave;
			`,
			varying: /*glsl*/ `
				varying float vNoise;
			`,
			beforeGl_Position: /*glsl*/ ` 
				float dist = distance(uv, u_clickPosition);

				newposition.z += u_click*10.*sin(dist*u_clickWave.strength + u_time);
				vNoise = u_click*sin(dist*10. - u_time);
      `
		};
		this.imageUniforms = {
			u_clickWave: { value: this.settings }
		};
	}

	setSettings(value: Settings) {
		if (!this.core) {
			throw new Error(`Unable set settings for ${this.constructor.name}, core is undefined`);
		}

		this.settings = value;

		this.core.storage.meshImages.forEach((img) => {
			this.setImageUniforms(img);
		});
	}

	async click(imageId: string, intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) {
		if (!this.core) {
			throw new Error(`Unable "play" click for ${this.constructor.name}, core is undefined`);
		}

		const img = this.core.storage.meshImages.get(imageId);

		if (intersects.length > 0 && img && img.material) {
			const { material } = img;

			material.uniforms.u_clickPosition.value = intersects[0].uv;

			this.core.controllers.render.isManualShouldRender = true;
			this.core.controllers.render.countClickRender += 1;

			anime({
				targets: material.uniforms.u_click,
				easing: "easeOutQuart",
				value: [1, 0]
			}).finished.then(() => {
				if (!this.core) throw new Error(`Unable anime in ${this.constructor.name}`);

				this.core.controllers.render.countClickRender -= 1;

				if (this.core.controllers.render.countClickRender === 0) {
					this.core.controllers.render.isManualShouldRender = false;
				}
			});
		}
	}

	setImageUniforms({ material }: MacawImage) {
		if (!material) {
			throw new Error(`Unable set uniforms for ${this.constructor.name}, material is undefined`);
		}

		material.uniforms.u_clickWave.value = this.settings;
	}
}
