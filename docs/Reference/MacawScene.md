# MacawScene

The main class on which everything is based!

## Arguments

| Key | Value |
| ------------ | ------------ |
| `container` | [`<div>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div) element |
| `sceneSettings` | Look below at [`sceneSettings` properties](#scenesettings-properties) |

### `sceneSettings` properties:

| Key | Type | Default value | Description |
| --- | ---- | -------- | ----------- |
| `alpha` | `boolean?` | `true` | Is background transparent |
| `color` | `number? (Hexadecimal)` | `0xffffff` | Color of background |
| `maxDPR` | `number?` | `1.75` | Pixel ratio<br/>(`Math.min(devicePixelRatio, maxDPR)`) |
| `type` | `string?`: `"aboslute"`\|`"fixed"` | [Position](https://developer.mozilla.org/en-US/docs/Web/CSS/position) of `container` or `absolute` | See the difference between `fixed` and `absolute`: [Link to reference](/) |

## Methods

🚧 WIP 🚧

## Properties

### .time
Number

Each [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) increases for `0.5`

### .settings
Object - [`sceneSettings`](/#scenesettings-properties)

### .utils
Object

| Key | Value |
| --- | ----- |
| vector2 | `readonly`, [THREE.Vector2](https://threejs.org/docs/index.html?q=Vector2#api/en/math/Vector2) |

### .render
Object

| Key | Value |
| --- | ----- |
| isManualShouldRender | `boolean` |
| isImage | `boolean`  |
| isShaderPass | `boolean`  |
| countClickRender | `number`  |
| countEffectsShaderPass | `number`  |
| countEffectsImage | `number`  |

### .macaws
Object

| Key | Value |
| --- | ----- |
| composer | `MacawComposer` |
| scroll | `MacawScroll`  |
| resize | `MacawResize`  |
| observer | `MacawObserver`  |

### .storage
Object

| Key | Value |
| --- | ----- |
| mapMeshImages | `readonly`, `Map` of `string: MacawImage` |
| mapEffects | `readonly`, `Map` of `string: GeneralEffect` |
| images | `readonly`, `Array` of `HTMLImageElement`  |

### .core
Object

| Key | Value |
| --- | ----- |
| container | `readonly`, `HTMLDivElement` |
| dimensions | Object:<br/>{ width: `number`, height: `number` } |
| scene | [THREE.Scene](https://threejs.org/docs/index.html?q=scene#api/en/scenes/Scene)  |
| camera | [THREE.PerspectiveCamera](https://threejs.org/docs/index.html?q=persp#api/en/cameras/PerspectiveCamera)  |
| renderer | [THREE.WebGLRenderer](https://threejs.org/docs/index.html?q=WebGLRenderer#api/en/renderers/WebGLRenderer)  |
| raycaster | [THREE.Raycaster](https://threejs.org/docs/index.html?q=Raycaster#api/en/core/Raycaster)  |

### .image
Object

| Key | Value |
| --- | ----- |
| shader | `MacawImageShader` |
| baseMaterial | [THREE.ShaderMaterial](https://threejs.org/docs/index.html?q=ShaderMaterial#api/en/materials/ShaderMaterial) |

### .composer
Object

| Key | Value |
| --- | ----- |
| shader | `MacawComposerShader` |
| shaderEffect | [See below](#shadereffect-properties) |

#### `shaderEffect` properties

| Key | Value |
| --- | ----- |
| uniforms | `Uniform` |
| fragmentShader | `string` |
| vertexShader | `string` |
