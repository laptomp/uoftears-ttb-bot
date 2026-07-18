import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	Interaction,
	Message,
	MessageActionRowComponentBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { getCourse } from "../../api";
import { WatchDatabase } from "../../database/watch-database";
import { Course, CourseSection } from "../../types";
import { getCancelButton, getConfirmationButton } from "../components/buttons";
import { getCourseSectionsEmbed } from "../components/embeds";

module.exports = {
	command: new SlashCommandBuilder()
		.setName("start-message-watch")
		.setDescription("Starts a message watch based on a given course in the current channel")
		.addStringOption((option) =>
			option
				.setName("code")
				.setDescription("The course code for the course that will be watched")
				.setMinLength(6)
				.setMaxLength(8)
				.setRequired(true),
		),
	async execute(userCommand: ChatInputCommandInteraction) {
		if (userCommand.user.id !== "530824540113338368") {
			return;
		}

		const response = await userCommand.reply("Processing...");

		const givenCourseCode = userCommand.options.getString("code");

		if (!givenCourseCode) {
			userCommand.reply("You need to provide me with a course code to search.");
			return;
		}

		const course: Course = await getCourse(givenCourseCode.toUpperCase(), [
			"ARTSC",
			"SCAR",
			"ERIN",
		]);

		const sectionsCount = course.sections.reduce(
			(count: Record<string, number>, section: CourseSection) => {
				count[section.teachMethod] = (count[section.teachMethod] || 0) + 1;
				return count;
			},
			{},
		);

		let descriptionContent = `Offering ${sectionsCount["LEC"]} Lecture${sectionsCount["LEC"] !== 1 ? "s" : ""},`;
		descriptionContent += ` ${sectionsCount["PRA"] ?? 0} Practical${sectionsCount["PRA"] !== 1 ? "s" : ""},`;
		descriptionContent += ` and ${sectionsCount["TUT"] ?? 0} Tutorial${sectionsCount["TUT"] !== 1 ? "s" : ""}\n`;

		const embedResponse = new EmbedBuilder()
			.setTitle(`${course.code}: ${course.name} @ ${course.campus}`)
			.setDescription(descriptionContent);

		const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			getConfirmationButton(),
			getCancelButton(),
		);

		await userCommand.editReply({
			content: "",
			embeds: [embedResponse],
			components: [actionRow],
		});

		const collectorFilter = (interaction: Interaction) =>
			interaction.user.id === userCommand.user.id;

		const cancelEmbedResponse = async () => {
			const actionRow =
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					getConfirmationButton().setDisabled(true),
					getCancelButton().setDisabled(true),
				);

			embedResponse.setColor("Red");

			await userCommand.editReply({
				content: "",
				embeds: [embedResponse],
				components: [actionRow],
			});
		};

		try {
			const confirmation = await response.awaitMessageComponent({
				filter: collectorFilter,
				time: 60000,
			});

			if (confirmation.customId === "confirm") {
				const message: Message = await response.fetch();
				await WatchDatabase.addChannelWatch(course, message.id, message.channel.id);
				const replyContent = await getCourseSectionsEmbed(course);
				await confirmation.update({
					content: `Last updated <t:${Math.trunc(Date.now() / 1000)}:R>`,
					embeds: [replyContent[0]],
					files: [replyContent[1]],
					components: [],
				});
			} else {
				await cancelEmbedResponse();
				await confirmation.update();
			}
		} catch {
			await cancelEmbedResponse();
		}
	},
};
