<header>

# `<multi-range>`

Web component for dual handle sliders — so you can select an _actual_ range!

</header>

## History

This [started](v1/) as a tiny polyfill for native dual-handle sliders (`<input type=range multiple>`), when this was still a planned feature.
In fact, it became popular enough that its CSS variables appeared in the [most used CSS property names in 2020](https://almanac.httparchive.org/en/2020/css#naming) according to Web Almanac!
Unfortunately, `<input type=range multiple>` was [dropped from the spec in 2016](https://github.com/LeaVerou/multirange/issues/37).
After almost a decade of hiatus, multirange is now resurrected for the modern web, as a web component!

## Examples

<!-- Basic usage:

```html
<multi-range></multi-range>
```

Let’s add an input event handler to see what we’re doing:

```html
<multi-range oninput="this.nextElementSibling.textContent = this.value"></multi-range>
<output></output>
``` -->

Setting different initial values:

```html
<multi-range valuelow="30" valuehigh="60"
 oninput="this.nextElementSibling.textContent = this.value"></multi-range>
<output></output>
```

<!-- With min/max/step:

```html
<multi-range min="-180" max="180" step="0.1"
 oninput="this.nextElementSibling.textContent = this.value"></multi-range>
 <output></output>
```
 -->
