export function calculateCameraFov(height: number, z: number) {
	return 2 * Math.atan(height / 2 / z) * (180 / Math.PI);
}
