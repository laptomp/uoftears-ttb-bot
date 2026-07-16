import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
	command: SlashCommandBuilder;
	execute: (userCommand: ChatInputCommandInteraction) => Promise<void>;
}