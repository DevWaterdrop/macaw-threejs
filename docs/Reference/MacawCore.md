# MacawCore

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

### cleanUp()

Clean up every events / observers attached to core

### addEffect()

Add effect to scene<br/>
(Need to pass key and created custom or default effect!)

**Arguments:**

| Key | Type | Description |
| --- | ---- | ----------- |
| `key` | `string` | Unique key for effect |
| `effect` | `Effect` | Custom Macaw effect<br/>🚧 WIP 🚧 |

Returns `Boolean` as result of success

### removeEffect()

Remove effect from scene by unique key

**Arguments:**

| Key | Type | Description |
| --- | ---- | ----------- |
| `key` | `string` | Unique key of effect |

Returns `Boolean` as result of success