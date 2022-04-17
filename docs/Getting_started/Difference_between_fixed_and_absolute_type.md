# Difference between fixed and absolute type

Why is there a choice between `fixed` and `absolute` at all? The main problem is that you can't perfectly insert 3D objects into a web page. That why we provide you two options, and each with its pros and cons.

## Fixed

The main advantage of the `fixed` type is **performance**! The canvas is only the size of the viewport, so the render size is much smaller than the `absolute` type (100% of the height and width of the web page).<br/>
But like I said there is always a problem, you will get a **jelly effect** when scrolling.

**Jelly effect** – in short, this is when the render doesn't keep up with the scrolling, and because of that, the positions of 3D objects don't match their HTML counterparts! 

But it all depends on the video card and the number of effects and 3D objects on the screen (Macaw Three.js uses [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and renders only what enters the viewport).
<br/>
For example with [AMD R9 290](https://www.amd.com/en/press-releases/amd-radeon-r9-290-2013nov05) (GPU from 2013!) no jelly effect whatsoever, so decent amount of users won't see this issue (jelly effect).

## Absolute

As you might guess after reading [Fixed](#fixed), the main advantage of `absolute` type is the lack of jelly effect. But as usual, there is a downside :(<br/>
Unlike of `fixed` type, performance is worse because canvas height and width is 100% of web page.<br/>
This type is well suited if the web page length is not huge. But in fact, this isn`t so critical, since everything that gets to the viewport is rendered and no more.

<br/>

**I think it has become clearer which type to choose, so the choice is yours!**