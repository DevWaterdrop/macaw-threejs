import * as THREE from "three";
import type { Uniform } from "../Effect";
import type { MacawCore } from "../Core";

interface Props {
	core: MacawCore;
	element: HTMLImageElement;
	id: string;
}

export class MacawImage {
	element: HTMLImageElement;

	mesh?: THREE.Mesh;
	material?: THREE.ShaderMaterial;
	texture?: THREE.Texture;

	private _core: MacawCore;
	private _id: string;

	constructor(props: Props) {
		const { element, core, id } = props;

		this._core = core;
		this.element = element;
		this._id = id;
	}

	cleanUp() {
		this.element.removeEventListener("click", this._clickEvent.bind(this));
	}

	setPosition(resize = false) {
		if (!this.mesh || !this.material) {
			throw new Error("Unable to set position, mesh or material is undefined");
		}

		const { width, height, top, left } = this.element.getBoundingClientRect();

		if (resize) this.mesh.visible = true;

		this.material.uniforms.u_scale.value = [
			Math.min((width * this.element.naturalHeight) / (height * this.element.naturalWidth), 1),
			1
		];

		this.mesh.scale.set(width, height, 1);

		const { scroll, scene } = this._core;

		this.mesh.position.y = this._calculateMeshPositionY(
			scroll.currentScroll,
			scene.dimensions.height,
			top,
			height
		);
		this.mesh.position.x = this._calculateMeshPositionX(left, width, scene.dimensions.width);

		this.mesh.updateMatrix();
	}

	refreshMaterial(additionalUniforms: Uniform = {}) {
		if (!this.mesh) throw new Error("Unable to refresh material, mesh is undefined");

		const { uniforms, fragmentShader, vertexShader } = this._core.controllers.shader.image.shader;

		const shaderMaterial = new THREE.ShaderMaterial({
			uniforms: { ...additionalUniforms, ...uniforms },
			fragmentShader: fragmentShader,
			vertexShader: vertexShader
		});

		const newMaterial = shaderMaterial.clone();
		newMaterial.uniforms.u_image.value = this.texture;

		this.material = newMaterial;

		if (this.mesh.material instanceof Array) {
			this.mesh.material.map((material) => material.dispose());
		} else {
			this.mesh.material.dispose();
		}

		this.mesh.material = newMaterial;
	}

	setUniforms() {
		if (!this.material) throw new Error("Unable to set uniforms, material in undefined");
		this.material.uniforms.u_time.value = this._core.controllers.render.time;

		this._core.storage.effects.forEach((effect) => {
			if (effect.setImageUniforms) {
				effect.setImageUniforms(this);
			}
		});
	}

	async create() {
		const geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 10);

		this.texture = await new THREE.TextureLoader().loadAsync(this.element.src);

		const material = this._core.controllers.shader.image.baseMaterial.clone();
		material.uniforms.u_image.value = this.texture;

		const mesh = new THREE.Mesh(geometry, material);

		// Events
		this.element.addEventListener("click", this._clickEvent.bind(this));
		// --- end of Events

		mesh.matrixAutoUpdate = false;

		this.element.id = this.element.id || `threejs_img_${this._id}`;

		this.mesh = mesh;
		this.material = material;

		// ? Currently removed, may cause bugs. Investigations are underway!
		// this.setPosition();

		this._core.observer.instance.observe(this.element);
		this._core.scene.scene.add(mesh);

		this._core.storage.meshImages.set(this.element.id, this);

		this._core.controllers.general.setImagesPosition({});
		this._core.controllers.render.manualRender();
	}

	private _clickEvent(event: MouseEvent) {
		this._core.utils.vector2.setX((event.clientX / window.innerWidth) * 2 - 1);
		this._core.utils.vector2.setY(-(event.clientY / window.innerHeight) * 2 + 1);

		this._core.scene.raycaster.setFromCamera(this._core.utils.vector2, this._core.scene.camera);
		const intersects = this._core.scene.raycaster.intersectObjects(this._core.scene.scene.children);

		this._core.storage.effects.forEach((effect) => {
			new Promise(() => {
				if (effect.click) effect.click(this.element.id, intersects);
			});
		});
	}

	private _calculateMeshPositionY(
		currentScroll: number,
		dimensionHeight: number,
		elementTop: number,
		elementHeight: number
	) {
		const calculation = -currentScroll - elementTop + dimensionHeight / 2 - elementHeight / 2;
		return calculation;
	}

	private _calculateMeshPositionX(
		elementLeft: number,
		elementWidth: number,
		dimensionWidth: number
	) {
		const calculation = elementLeft - dimensionWidth / 2 + elementWidth / 2;
		return calculation;
	}
}
