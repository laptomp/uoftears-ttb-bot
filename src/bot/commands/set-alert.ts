import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	Interaction,
	InteractionContextType,
	MessageActionRowComponentBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { getCourse } from "../../api";
import { WatchDatabase } from "../../database/watch-database";
import { Course, CourseSection } from "../../api";
import { isExistingSection } from "../../utils";
import { getCancelButton } from "../components/buttons";
import { getCourseSectionEmbed, timedOutEmbed } from "../components/embeds";

module.exports = {
	command: new SlashCommandBuilder()
		.setName("set-alert")
		.setDescription("Set an alert for a specific course section")
		.addStringOption((option) =>
			option
				.setName("code")
				.setDescription("The course code for the course that will be watched")
				.setMinLength(6)
				.setMaxLength(8)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("section")
				.setDescription("The section code being watched for space")
				.setMinLength(4)
				.setMaxLength(7)
				.setRequired(true),
		).setContexts([
					InteractionContextType.Guild,
					InteractionContextType.BotDM,
					InteractionContextType.PrivateChannel,
				]),
	async execute(userCommand: ChatInputCommandInteraction) {
		const response = await userCommand.reply("Processing...");

		const givenCourseCode = userCommand.options.getString("code")!;
		const givenSectionCode = userCommand.options.getString("section")!.toUpperCase();

		const course: Course = await getCourse(givenCourseCode.toUpperCase(), [
			"ARTSC",
			"SCAR",
			"ERIN",
		]);

		if (!isExistingSection(course, givenSectionCode)) {
			await userCommand.editReply(
				`❌ **${givenSectionCode}** is **not a valid section code** for ${course.code}: ${course.name}` +
					`\n-# Try using \`/search\` to find an existing section code`,
			);
			return;
		}

		const section: CourseSection = course.sections.find(
			(section) => section.name === givenSectionCode,
		)!;

		const embedResponse: EmbedBuilder = getCourseSectionEmbed(course, section);

		const dmAlertButton = new ButtonBuilder()
			.setCustomId("dm")
			.setLabel("Start DM Alerts")
			.setStyle(ButtonStyle.Success);
		const channelAlertButton = new ButtonBuilder()
			.setCustomId("channel")
			.setLabel("Start Channel Alerts")
			.setStyle(ButtonStyle.Primary);
		const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			dmAlertButton,
			channelAlertButton,
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
					dmAlertButton.setDisabled(true),
					channelAlertButton.setDisabled(true),
					getCancelButton().setDisabled(true),
				);
			embedResponse.setColor("Red");
			await userCommand.editReply({
				embeds: [embedResponse],
				components: [actionRow],
			});
		};

		try {
			const confirmation = await response.awaitMessageComponent({
				filter: collectorFilter,
				time: 60000,
			});
			if (["dm", "channel"].includes(confirmation.customId)) {
				debugger;
				const alertChannelId =
					confirmation.customId === "dm"
						? (await confirmation.user.createDM(true)).id
						: (await response.fetch()).channelId;
				await WatchDatabase.addIndividualWatch(
					course,
					givenSectionCode,
					confirmation.user,
					alertChannelId,
				);
				const actionRow =
					new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
						dmAlertButton.setDisabled(true),
						channelAlertButton.setDisabled(true),
						getCancelButton().setDisabled(true),
					);
				await confirmation.update({
					embeds: [
						embedResponse.setColor(
							confirmation.customId === "dm" ? "Green" : "Blurple",
						),
					],
					components: [actionRow],
				});
			} else {
				await cancelEmbedResponse();
				await confirmation.update();
			}
		} catch (error) {
			await cancelEmbedResponse();
			await userCommand.followUp({ embeds: [timedOutEmbed()] });
		}
	},
};
