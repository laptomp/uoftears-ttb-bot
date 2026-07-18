import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Course, CourseSection } from "../../types";
import { sortSections } from "../../utils";

export async function getCourseSectionsEmbed(
	course: Course,
): Promise<[EmbedBuilder, AttachmentBuilder]> {
	let descriptionContent = `This course is offered in the ${course.sectionCode === "F" ? "Fall" : "Winter"}`;

	course.sections = sortSections(course.sections);

	const sectionsCount = course.sections.reduce(
		(count: Record<string, number>, section: CourseSection) => {
			count[section.teachMethod] = (count[section.teachMethod] || 0) + 1;
			return count;
		},
		{},
	);

	descriptionContent += ` with ${sectionsCount["LEC"]} Lecture${sectionsCount["LEC"] !== 1 ? "s" : ""},`;
	descriptionContent += ` ${sectionsCount["PRA"] ?? 0} Practical${sectionsCount["PRAC"] !== 1 ? "s" : ""},`;
	descriptionContent += ` and ${sectionsCount["TUT"] ?? 0} Tutorial${sectionsCount["TUT"] !== 1 ? "s" : ""}\n`;

	const fieldContents: Record<string, { name: string; value: string; inline: boolean }> = {
		LEC: { name: "Lectures 📚", value: "", inline: false },
		TUT: { name: "Tutorials ✍️", value: "", inline: false },
		PRA: { name: "Practicals 🔬", value: "", inline: false },
	};

	const fieldTracker: Record<string, string> = {
		LEC: "LEC",
		TUT: "TUT",
		PRA: "PRA",
	};

	course.sections.map((section: CourseSection) => {
		const spots = section.maxEnrolment - section.currentEnrolment;
		let addingString = (() => {
			const percentage = (spots / section.maxEnrolment) * 100;
			switch (true) {
				case percentage === 0:
					return "🟥";
				case percentage < 15:
					return "🟧";
				case percentage < 25:
					return "🟨";
				default:
					return "🟩";
			}
		})();
		addingString += ` **${section.name}**`;
		addingString += ` with ${spots}/${section.maxEnrolment} spots remaining`;
		if (section.currentWaitlist > 0) {
			addingString = ` and a waitlist of ${section.currentWaitlist}`;
		}

		const currentFieldString = fieldContents[fieldTracker[section.teachMethod]]["value"];
		if (currentFieldString.length + addingString.length + 1 > 1024) {
			fieldTracker[section.teachMethod] = fieldTracker[section.teachMethod] + "+";
			fieldContents[fieldTracker[section.teachMethod]] = {
				name: "",
				value: addingString + "\n",
				inline: false,
			};
			return;
		}
		fieldContents[fieldTracker[section.teachMethod]]["value"] += addingString + "\n";
	});

	const embedFields = Object.entries(fieldContents)
		.filter(([teachMethod, field]) => {
			return field["value"];
		})
		.map(([teachMethod, field]) => {
			return field;
		});

	const image = new AttachmentBuilder("./src/bot/assets/UofTlogo.png", {
		name: "jpg.jpg", // will be sent as jpg.jpg
	});

	const embedResponse = new EmbedBuilder()
		.setTitle(`${course.code}: ${course.name}`)
		.setDescription(descriptionContent)
		.addFields(embedFields)
		.setFooter({ text: `Course ID: ${course.id}` })
		.setAuthor({
			name: "From the University of Toronto Timetable Builder",
			iconURL: "attachment://jpg.jpg",
		});

	return [embedResponse, image];
}

export function getCourseSectionEmbed(course: Course, section: CourseSection): EmbedBuilder {
	const descriptionContent = `Offered during the ${course.sectionCode === "F" ? "Fall" : "Winter"} session`;
	const fieldName = `${section.name} ${section.teachMethod === "LEC" ? "📚" : section.teachMethod === "TUT" ? "✍️" : "🔬"}`;
	let fieldContent =
		section.instructors.length > 0
			? `**Instructors**: ${section.instructors.map((i) => `${i.firstName} ${i.lastName}`).join(", ")}`
			: "**Instructors**: N/A";
	fieldContent += `\n**Spaces**: ${section.maxEnrolment - section.currentEnrolment}/${section.maxEnrolment}`;
	return new EmbedBuilder()
		.setTitle(`${course.code}: ${course.name}`)
		.setDescription(descriptionContent)
		.addFields({ name: fieldName, value: fieldContent });
}

export function timedOutEmbed() {
	return new EmbedBuilder()
		.setTitle("Response timed out (user did not respond for 1 minute)")
		.setColor("DarkRed");
}
