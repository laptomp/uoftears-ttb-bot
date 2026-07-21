import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import config from "../config";

export async function deployCommands() {
	const TOKEN: string = process.env.TOKEN!;

	const commands: Array<any> = [];

	const commandsFolderPath: string = path.join(__dirname, "./commands");
	fs.readdirSync(commandsFolderPath)
		.filter((file) => {
			return !file.includes(".d.");
		})
		.map((commandFile: string) => {
			const filePath: string = path.join(commandsFolderPath, commandFile);
			const command = require(filePath);

			if (!command || typeof command !== "object") {
				console.error(`Incorrect command format at ${filePath}`);
			} else {
				commands.push(command.command.toJSON());
			}
		});

	console.log(commands.map((command) => command.name).join(", "));

	const rest: REST = new REST().setToken(TOKEN);

	try {
		await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
	} catch (error) {
		console.log(`Something went wrong while uploading commands: ${error}`);
		process.exit(1);
	}
}
