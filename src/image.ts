import * as THREE from "three";
import type { Uniform } from "./effect";
import type { MacawScene } from "./scene";

interface Props {
	scene: MacawScene;
	element: HTMLImageElement;
	id: string;
}

export class MacawImage {
	element: HTMLImageElement;

	mesh?: THREE.Mesh;
	material?: THREE.ShaderMaterial;
	texture?: THREE.Texture;

	private scene: MacawScene;
	private id: string;

	constructor(options: Props) {
		const { element, scene, id } = options;

		this.scene = scene;
		this.element = element;
		this.id = id;
	}

	cleanUp() {
		this.element.removeEventListener("click", this.clickEvent.bind(this));
	}

	setPosition(resize = false) {
		if (!this.mesh || !this.material) {
			throw new Error("Unable to set position, mesh or material is undefined");
		}

		const { width, height, top, left } = this.element.getBoundingClientRect();

		if (resize) this.mesh.visible = true;

		// ? Maybe remove Math.min
		this.material.uniforms.u_scale.value = [
			Math.min((width * this.element.naturalHeight) / (height * this.element.naturalWidth), 1),
			1
		];

		this.mesh.scale.set(width, height, 1);

		const { macawOBJ, coreOBJ } = this.scene;

		this.mesh.position.y = this.calculateMeshPositionY(
			macawOBJ.scroll.currentScroll,
			coreOBJ.dimensions.height,
			top,
			height
		);
		this.mesh.position.x = this.calculateMeshPositionX(left, width, coreOBJ.dimensions.width);

		this.mesh.updateMatrix();
	}

	refreshMaterial(additionalUniforms: Uniform = {}) {
		if (!this.mesh) throw new Error("Unable to refresh material, mesh is undefined");

		const shaderMaterial = new THREE.ShaderMaterial({
			uniforms: { ...additionalUniforms, ...this.scene.imageOBJ.shader.uniforms },
			fragmentShader: this.scene.imageOBJ.shader.fragmentShader,
			vertexShader: this.scene.imageOBJ.shader.vertexShader
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
		this.material.uniforms.u_time.value = this.scene.time;

		this.scene.storageOBJ.mapEffects.forEach((effect) => {
			if (effect.setImageUniforms) {
				effect.setImageUniforms(this);
			}
		});
	}

	async create() {
		const geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 10);

		this.texture = await new THREE.TextureLoader().loadAsync(this.element.src);

		const material = this.scene.imageOBJ.baseMaterial.clone();
		material.uniforms.u_image.value = this.texture;

		const mesh = new THREE.Mesh(geometry, material);

		// Events
		this.element.addEventListener("click", this.clickEvent.bind(this));
		// --- end of Events

		mesh.matrixAutoUpdate = false;

		this.element.id = this.element.id ? this.element.id : `threejs_img_${this.id}`;

		this.mesh = mesh;
		this.material = material;

		this.setPosition();

		this.scene.macawOBJ.observer.instance.observe(this.element);
		this.scene.coreOBJ.scene.add(mesh);
	}

	private clickEvent(event: MouseEvent) {
		this.scene.utilsOBJ.vector2.setX((event.clientX / window.innerWidth) * 2 - 1);
		this.scene.utilsOBJ.vector2.setY(-(event.clientY / window.innerHeight) * 2 + 1);

		this.scene.coreOBJ.raycaster.setFromCamera(
			this.scene.utilsOBJ.vector2,
			this.scene.coreOBJ.camera
		);
		const intersects = this.scene.coreOBJ.raycaster.intersectObjects(
			this.scene.coreOBJ.scene.children
		);

		// TODO Maybe split effects on click/scroll/etc...
		this.scene.storageOBJ.mapEffects.forEach((effect) => {
			if (effect.click) {
				new Promise(() => {
					// TODO Refactor
					if (effect.click) effect.click(this.element.id, intersects);
				});
			}
		});
	}

	private calculateMeshPositionY(
		currentScroll: number,
		dimensionHeight: number,
		elementTop: number,
		elementHeight: number
	) {
		const calculation = -currentScroll - elementTop + dimensionHeight / 2 - elementHeight / 2;
		return calculation;
	}

	private calculateMeshPositionX(
		elementLeft: number,
		elementWidth: number,
		dimensionWidth: number
	) {
		const calculation = elementLeft - dimensionWidth / 2 + elementWidth / 2;
		return calculation;
	}
}
