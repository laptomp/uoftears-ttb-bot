export function isValidFullCourseCode(code: string): boolean {
	const pattern = /^(\w{3}\d{3}[HY][135]|\w{3}[ABCD]\d{2}[HY]3)$/;

	return pattern.test(code);
}

export function isValidCourseCode(code: string): boolean {
	const pattern = /^(\w{3}\d{3}|\w{4}\d{2})([HY][135]?)?$/;

	return pattern.test(code);
}
