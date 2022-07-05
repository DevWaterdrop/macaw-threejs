# Quick start

This example provides basic setup and usage.

## 1. Create a scene

```javascript
import { MacawCore } from 'macaw-threejs';

const scene = new MacawCore({ container, sceneSettings })
```

### `MacawCore` arguments

| Key | Value |
| ------------ | ------------ |
| `container` | [`<div>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div) element |
| `sceneSettings` | Look below at [`sceneSettings` properties](#scenesettings-properties) |

### `sceneSettings` properties

| Key | Type | Default value | Description |
| --- | ---- | -------- | ----------- |
| `alpha` | `boolean?` | `true` | Is background transparent |
| `color` | `number? (Hexadecimal)` | `0xffffff` | Color of background |
| `maxDPR` | `number?` | `1.75` | Pixel ratio<br/>(`Math.min(devicePixelRatio, maxDPR)`) |
| `type` | `string?`: `"aboslute"`\|`"fixed"` | [Position](https://developer.mozilla.org/en-US/docs/Web/CSS/position) of `container` or `absolute` | See the [Difference between fixed and absolute type](/Getting_started/Difference_between_fixed_and_absolute_type) |

`container` preferred style example (`fixed`/`absolute`):
```css
# – absolute version

.container {
  z-index: -1;
  position: fixed; # position: absolute;
  width: 100vw; # width: 100%;
  height: 100vh; # height: 100%;
  top: 0;
  left: 0;
}
```

## 2. Add an image to the scene

```javascript
import { MacawImage } from 'macaw-threejs';

const core = new MacawCore({ container, sceneSettings });
...
// Create method is an async function because of texture loading, need to await it.
await new MacawImage({ element: image, core, id: 'stop war' }).create()
```

## 3. Add effect

We will add the default effect, but you can create your effect based on `Effect` class.

```javascript
import { ClickWave } from 'macaw-threejs/effects';

const settings = { strength: 10.0 };
const effect = new ClickWave(settings);

scene.addEffect('clickWave', effect);
// Returns true/false depending on if the effect was added or not.
```