import { CourseSection } from "../api/types";

export function sortSections(sections: Array<CourseSection>): Array<CourseSection> {
	const methodOrder: Record<string, string> = { LEC: "0", TUT: "1", PRAC: "2" };

	return sections.sort((a, b) => {
		const aKey = methodOrder[a.teachMethod] + a.sectionNumber;
		const bKey = methodOrder[b.teachMethod] + b.sectionNumber;
		return aKey.localeCompare(bKey);
	});
}
