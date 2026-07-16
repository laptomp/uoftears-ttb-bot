import { Message, User } from "discord.js";
import { Events } from "discord.js";

module.exports = {
	name: Events.MessageCreate,

	async execute(message: Message) {
		message.mentions.users.map((user: User) => {
			if (user.id === "1527181018208014356") {
				message.react("💧");
			}
		});
	},
};
