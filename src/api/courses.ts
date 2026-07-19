import { AxiosError } from "axios";
import { AcademicDivision } from "../types/academic-divison";
import { Course } from "../types/course";
import { SearchedCourse } from "../types/searched-course";
import { getClient } from "./client";

/**
 * Get a sepcific course by course code.
 *
 * @param courseCode 	The course code being used to search for the course
 * @param divisions		An array containing the academic divisions being searched
 * @returns A promise of a `Course` instance matching `courseCode`
 * @throws {AxiosError} When an error triggers during the request
 * @throws {Error} When a course with `courseCode` could not be found
 */
export async function getCourse(
	courseCode: string,
	divisions: Array<AcademicDivision>,
): Promise<Course> {
	const searchedCourses = await searchCourseByTerm(
		courseCode,
		["20269", "20271", "20269-20271"],
		divisions,
	);

	const searchedCourse: SearchedCourse = (() => {
		for (const course of searchedCourses) {
			if (course.code.includes(courseCode)) {
				return course;
			}
		}
		throw new Error(`Course with courseCode '${courseCode}' could not be found`);
	})();

	const courses = await getClient()
		.post("/getPageableCourses", {
			availableSpace: false,
			courseCodeAndTitleProps: {
				courseCode: searchedCourse.code,
				courseSectionCode: searchedCourse.sectionCode,
				courseTitle: searchedCourse.name,
				searchCourseDescription: false,
			},
			departmentProps: [],
			divisions: divisions,
			page: 1,
			pageSize: 20,
			sessions: ["20269", "20271", "20269-20271"],
		})
		.catch((error: AxiosError) => {
			handleTears(error);
		});

	return courses.data.payload["pageableCourse"]["courses"][0] as Course;
}

/**
 * Search for a course by a string "term".
 *
 * @param term 		The term being used to search for a course
 * @param sessions	The sessions the course is being searched in
 * @param divisions	The academic divisions hosting the courses
 * @returns A promise for an array of `SearchedCourse` instances representing the matched courses
 * @throws {AxiosError} When an error triggers during the request
 */
export async function searchCourseByTerm(
	term: string,
	sessions: Array<string>,
	divisions: Array<AcademicDivision>,
): Promise<Array<SearchedCourse>> {
	const divisionsBody: string = divisions.join(",");

	const response = await getClient()
		.get("/getOptimizedMatchingCourseTitles", {
			params: {
				term: term,
				sessions: sessions,
				divisions: divisionsBody,
				lowerThreshold: 50,
				upperThreshold: 200,
			},
		})
		.catch(handleTears);

	return response.data["payload"]["codesAndTitles"] as Array<SearchedCourse>;
}

function handleTears(error: AxiosError): never {
	if (error.response) {
		// Server responded with status code outside the 200 category
		console.log(`An error with code ${error.code}`);
		console.log(error.toJSON());
		throw error;
	} else if (error.request) {
		// Request was made but no request was received
		console.log(`No response received with request: ${error.request}`);
		throw error;
	} else {
		// Something else happened that triggered an Error
		console.log(`An unknown error occurred: ${error.message}`);
		throw error;
	}
}
