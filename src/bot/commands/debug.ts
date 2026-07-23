import {
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";
import config from "../../config";

module.exports = {
	command: new SlashCommandBuilder()
		.setName("start-debugger")
		.setDescription("Starts debugging")
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
			InteractionContextType.PrivateChannel,
		]),
	async execute(userCommand: ChatInputCommandInteraction) {
		if (!config.developerIds.includes(userCommand.user.id)) {
			await userCommand.reply("You are not permitted to use this command.");
			return;
		}
		let content = "Starting debugger...";
		await userCommand.reply(content);
		debugger;
	},
};
