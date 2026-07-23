import {
	AttachmentBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";
import { getCourse } from "../../api";
import { Course } from "../../api";
import { getCourseSectionsEmbed } from "../components/embeds";

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
		).setContexts([
					InteractionContextType.Guild,
					InteractionContextType.BotDM,
					InteractionContextType.PrivateChannel,
				]),
	async execute(userCommand: ChatInputCommandInteraction) {
		const givenCourseCode = userCommand.options.getString("code");

		if (!givenCourseCode) {
			userCommand.reply("You need to provide me with a course code to search.");
			return;
		}

		let descriptionContent = `Searching for \`${givenCourseCode}\`...`;

		await userCommand.reply(descriptionContent);

		const course: Course = await getCourse(givenCourseCode.toUpperCase(), [
			"ARTSC",
			"SCAR",
			"ERIN",
		]);

		const replyContent: [EmbedBuilder, AttachmentBuilder] =
			await getCourseSectionsEmbed(course);

		await userCommand.editReply({
			content: "",
			embeds: [replyContent[0]],
			files: [replyContent[1]],
		});
	},
};
