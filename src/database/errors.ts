import { Course } from "../types";

export class CourseAlreadyExistsError extends Error {
	constructor(course: Course) {
		super(`Course already exists: ${course.code}`);
		this.name = "CourseAlreadyExistsError";
	}
}

export class CourseNotFoundError extends Error {
	constructor(courseId: string) {
		super(`Course could not be found: ${courseId}`);
		this.name = "CourseAlreadyExistsError";
	}
}

export class InvalidCourseCodeError extends Error {
	constructor(courseCode: string) {
		super(`Invalid course code provided: ${courseCode}`);
		this.name = "InvalidCourseCodeError";
	}
}

export class InvalidSectionNameError extends Error {
	constructor(sectionName: string) {
		super(`Invalid section name provided: ${sectionName}`);
		this.name = "InvalidSectionNameError";
	}
}
