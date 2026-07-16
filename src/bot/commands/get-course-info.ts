import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getCourse } from "../../api";
import { Course, CourseSection } from "../../types";
import { sortSections } from "../../utils";

module.exports = {
	command: new SlashCommandBuilder()
		.setName("search")
		.setDescription("Get enrolment info for a specific course")
		.addStringOption((option) =>
			option
				.setName("code")
				.setDescription("The course code for the course you are searching")
				.setMinLength(6)
				.setMaxLength(8)
				.setRequired(true),
		),
	async execute(userCommand: ChatInputCommandInteraction) {
		const givenCourseCode = userCommand.options.getString("code");

		if (!givenCourseCode) {
			userCommand.reply("You need to provide me with a course code to search.");
			return;
		}

		let content = `Searching for \`${givenCourseCode}\`...`;

		await userCommand.reply(content);

		const course: Course = await getCourse(givenCourseCode.toUpperCase(), [
			"ARTSC",
			"SCAR",
			"ERIN",
		]);

		content = `# ${course.code}: ${course.name}`;
		content += ` @ ${course.campus === "St. George" ? "UTSG" : course.campus === "Scarborough" ? "UTSC" : "UTM"}`;
		content += `\n-# This course is offered in the ${course.sectionCode === "F" ? "Fall" : "Winter"}`;

		course.sections = sortSections(course.sections);

		const sectionsCount = course.sections.reduce(
			(count: Record<string, number>, section: CourseSection) => {
				count[section.teachMethod] = (count[section.teachMethod] || 0) + 1;
				return count;
			},
			{},
		);

		content += ` with ${sectionsCount["LEC"]} Lecture${sectionsCount["LEC"] !== 1 ? "s" : ""},`;
		content += ` ${sectionsCount["PRAC"] ?? 0} Practical${sectionsCount["PRAC"] !== 1 ? "s" : ""},`;
		content += ` and ${sectionsCount["TUT"] ?? 0} Tutorial${sectionsCount["TUT"] !== 1 ? "s" : ""}\n`;

		course.sections.map((section: CourseSection) => {
			const spots = section.maxEnrolment - section.currentEnrolment;
			content += "\n";
			content += (() => {
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
			content += ` **${section.name}**`;
			content += ` with ${spots} spots remaining`;
			if (section.currentWaitlist > 0) {
				content += ` and a waitlist of ${section.currentWaitlist}`;
			}
		});

		await userCommand.editReply(content);
	},
};
