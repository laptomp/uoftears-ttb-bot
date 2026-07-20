import { Course } from "../api/types";

export function isValidFullCourseCode(code: string): boolean {
	const pattern = /^(\w{3}\d{3}[HY][135]|\w{3}[ABCD]\d{2}[HY]3)$/;

	return pattern.test(code);
}

export function isValidCourseCode(code: string): boolean {
	const pattern = /^(\w{3}\d{3}|\w{4}\d{2})([HY][135]?)?$/;

	return pattern.test(code);
}

export function isValidSectionName(section: string): boolean {
	return /^(LEC|TUT|PRA)\d{1,4}$/.test(section);
}

export function isExistingSection(course: Course, section: string): boolean {
	return isValidSectionName(section)
		? course.sections.find((s) => s.name === section)
			? true
			: false
		: false;
}
