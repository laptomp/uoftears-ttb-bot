import {
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";

module.exports = {
	command: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Get the Bucket's latency")
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
			InteractionContextType.PrivateChannel,
		]),
	async execute(userCommand: ChatInputCommandInteraction) {
		let content = "💧 A drop in the bucket echoes...";

		await userCommand.reply(content);

		const delay: number = Date.now() - userCommand.createdTimestamp;
		content += ` **(${delay}ms)**`;

		await userCommand.editReply(content);
	},
};
