import { Events, Interaction } from "discord.js";
import { Command } from "../types/Command";

module.exports = {
	name: Events.InteractionCreate,

	async execute(interaction: Interaction) {
		if (!interaction.isChatInputCommand()) {
			return;
		}

		const command: Command | undefined = interaction.client.commands.get(
			interaction.commandName,
		);

		if (!command) {
			console.log(`Non-existent command run: ${interaction.commandName}`);
			interaction.reply("You just ran a non-existent command...");
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			if (interaction.replied || interaction.deferred) {
				interaction.followUp("Something went wrong while executing this command.");
                console.log(error);
			} else {
				interaction.reply("Something went wrong while executing this command.");
			}
		}
	},
};
