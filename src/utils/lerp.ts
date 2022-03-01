export const lerp = (x: number, y: number, ease: number) => {
	return (1 - ease) * x + ease * y;
};
