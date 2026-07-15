export type SearchedCourse = {
	code: string;
	sectionCode: "F" | "S" | "Y";
	name: string;
	description: string;
	sessions: Array<number>;
	division: {
		code: string;
		name: string;
	};
	rank: number;
};
