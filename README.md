# Macaw Three.js

It's ready to use library to connect Three.js with your project.<br/>
Currently, support only images.<br/>
[Preview link](https://performance-threejs.vercel.app/ 'Link to preview')

## Quick Start

**1. Create a scene.**

```javascript
import { MacawScene } from 'macaw-threejs';

const scene = new MacawScene({ container, sceneSettings, type })
```

`MacawScene` Props:

| Key | Value |
| ------------ | ------------ |
| `container` | `div` element |
| `sceneSettings` | <br/>`alpha` – `boolean`;<br/>`color` – `number` (e.g. `0x000000`);<br/>`maxDPR?` – `number`, optional, **default**: `1.75`. |
| `type?`  | optional, **default**: `absolute`;<br/>**accaptable values**: `fixed`, `absolute`;<br/>(`SCENE_TYPE` enum). |

Container(`HTMLDivElement`) preffered style example (`fixed`/`absolute`):
```css
.container {
	z-index: -1;
	position: fixed; // position: absolute;
	width: 100vw; // width: 100%;
	height: 100vh; // height: 100%;
	top: 0;
	left: 0;
}
```

**2. Add an image to the scene.**

```javascript
import { MacawScene, MacawImage } from 'macaw-threejs';

const img = new MacawImage({ element, scene, id }); // id – string
// Create method is an async function because of texture loading, need to await it.
await img.create();
scene.Image = img; // Finally, Set Image to scene 👏
```

**3. Add effect**

We will add the default effect, but you can create your effect based on `Effect` class.

```javascript
import { ClickWave } from 'macaw-threejs';

const settings = { strength: 10.0 };
const effect = new ClickWave(settings);

scene.addEffect('clickWave', effect));
// Returns true/false depending on if the effect was added or not.
```

## Word from author

Have fun! ✌️

<a href="https://www.halo-lab.com/?utm_source=github">
  <img src="https://dgestran.sirv.com/Images/supported-by-halolab.png" alt="Supported by Halo lab" height="60">
</a>
