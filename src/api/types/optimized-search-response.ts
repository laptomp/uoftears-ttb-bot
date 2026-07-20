import { SearchedCourse } from "./searched-course";

export type OptimizedSearchResponse = {
	codesAndTitles: Array<SearchedCourse>;
	term: string;
	lowerThreshold: number;
	upperThreshold: number;
	total: number;
};
