import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Command } from "./bot/types/Command";
import { deployCommands } from "./bot/deploy-commands";
import { CourseDatabase } from "./database";
import { WatchDatabase } from "./database/watch-database";

declare module "discord.js" {
	export interface Client {
		commands: Collection<string, Command>;
	}
}

/* -- Environment Variables Check -- */

dotenv.config({ debug: false });

const SECRET: string | undefined = process.env.BOT_SECRET;
const TOKEN: string | undefined = process.env.BOT_TOKEN;

if (!SECRET || !TOKEN) {
	console.log("Missing required credentials in .env");
	process.exit(1);
}

/* -- Database Startup -- */
(async () => {
	await CourseDatabase.synchronizeTable(false, true);
	await WatchDatabase.synchronizeAll(false, true);
})();

/* -- Client Setup -- */

const discordClient: Client = new Client({
	intents: [
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Channel],
});

discordClient.commands = new Collection();

// Setting up client commands
const commandsFolderPath: string = path.join(__dirname, "./bot/commands");
fs.readdirSync(commandsFolderPath)
	.filter((file) => {
		return !file.includes(".d.");
	})
	.map((commandFile: string) => {
		const filePath: string = path.join(commandsFolderPath, commandFile);
		const command = require(filePath);

		if (!command || typeof command !== "object") {
			console.error(`Invalid correct format in ${filePath}`);
		} else {
			discordClient.commands.set(command.command.name, command);
		}
	});

// Setting up client events
const eventsFolderPath: string = path.join(__dirname, "./bot/events");
fs.readdirSync(eventsFolderPath).map((eventFile) => {
	if (!eventFile.includes(".js")) return;
	const filePath: string = path.join(eventsFolderPath, eventFile);
	const event = require(filePath);

	if (event.once) {
		discordClient.once(event.name, (...args) => event.execute(...args));
	} else {
		discordClient.on(event.name, (...args) => event.execute(...args));
	}
});

/* -- Client Startup -- */

(async () => {
	console.log("Deploying commands...");
	await deployCommands();
	console.log("Commands deploying.\nLogging into client.");
	await discordClient.login(TOKEN);
})();
