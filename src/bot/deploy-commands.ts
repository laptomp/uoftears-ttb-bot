import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

export async function deployCommands() {
	const BOT_TOKEN: string | undefined = process.env.BOT_TOKEN;

	if (!BOT_TOKEN) {
		console.log("Client token missing, cannot deploy commands");
		process.exit(1);
	}

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

    console.log(commands);

	const rest: REST = new REST().setToken(BOT_TOKEN);

	try {
		await rest.put(Routes.applicationCommands("1527181018208014356"), { body: commands });
	} catch (error) {
		console.log(`Something went wrong while uploading commands: ${error}`);
		process.exit(1);
	}
}
