import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import config from "../../config";

module.exports = {
	command: new SlashCommandBuilder().setName("start-debugger").setDescription("Starts debugging"),
	async execute(userCommand: ChatInputCommandInteraction) {
		if (config.developerIds.includes(userCommand.user.id)) {
			await userCommand.reply("You are not permitted to use this command.");
			return;
		}
		let content = "Starting debugger...";
		await userCommand.reply(content);
		debugger;
	},
};
