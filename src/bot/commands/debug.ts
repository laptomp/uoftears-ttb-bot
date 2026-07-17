import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	command: new SlashCommandBuilder().setName("start-debugger").setDescription("Starts debugging"),
	async execute(userCommand: ChatInputCommandInteraction) {
		if (userCommand.user.id !== "530824540113338368") {
			await userCommand.reply("You are not permitted to use this command.");
			return;
		}
		let content = "Starting debugger...";
		await userCommand.reply(content);
		debugger;
	},
};
