import { CourseSection } from "./course-section";

export type Course = {
	id: string;
	name: string;
	code: string;
	sectionCode: string;
	campus: "St. George" | "Scarborough" | "University of Toronto at Mississauga";
	sessions: Array<string>;
	sections: CourseSection[];
	cmCourseInfo: {
		description: string;
		title: string;
		levelOfInstruction: "undergraduate" | "graduate";
		prerequisitesText: string;
		corequisitesText: string;
		exclusionsText: string;
		recommendedPreparation: string;
		division: string;
		breadthRequirements: Array<string>;
		distributionRequirements: Array<string>;
		publicationsSections: Array<string>;
	};
	created: string;
	primaryTeachMethod: "LEC" | "PRAC" | "TUT";
	faculty: {
		code: string;
		name: string;
	};
	department: {
		code: string;
		name: string;
	};
	cancelInd: "Y" | "N";
	primaryFull: boolean;
	fullyOnline: boolean;
};
