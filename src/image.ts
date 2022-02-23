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

		this.mesh.position.y =
			-this.scene.currentScroll - top + this.scene.dimensions.height / 2 - height / 2;
		this.mesh.position.x = left - this.scene.dimensions.width / 2 + width / 2;

		this.mesh.updateMatrix();
	}

	refreshMaterial(additionalUniforms: Uniform = {}) {
		if (!this.mesh) throw new Error("Unable to refresh material, mesh is undefined");

		const { imageShader } = this.scene;
		const shaderMaterial = new THREE.ShaderMaterial({
			uniforms: { ...additionalUniforms, ...imageShader.uniforms },
			fragmentShader: imageShader.fragmentShader,
			vertexShader: imageShader.vertexShader
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

	async create() {
		const geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 10);
		// TODO Use code below (this method cause error: GL ERROR:GL_INVALID_VALUE: glTexSubImage2D: bad dimensions)
		/*
			const texture = new THREE.Texture();
			texture.needsUpdate = true;
		*/
		this.texture = await new THREE.TextureLoader().loadAsync(this.element.src);

		const material = this.scene.baseMaterial.clone();
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

		this.scene.observer.observe(this.element);
		this.scene.scene.add(mesh);
	}

	private clickEvent(event: MouseEvent) {
		const { vector2, raycaster, camera, scene, mapEffects } = this.scene;

		vector2.setX((event.clientX / window.innerWidth) * 2 - 1);
		vector2.setY(-(event.clientY / window.innerHeight) * 2 + 1);

		raycaster.setFromCamera(vector2, camera);
		const intersects = raycaster.intersectObjects(scene.children);

		// TODO Maybe split effects on click/scroll/etc...
		mapEffects.forEach((effect) => {
			if (effect.click) effect.click(this.element.id, intersects);
		});
	}
}
