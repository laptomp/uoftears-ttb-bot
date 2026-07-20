import { Events, Message, User } from "discord.js";
import config from "../../config";

module.exports = {
	name: Events.MessageCreate,

	async execute(message: Message) {
		message.mentions.users.map((user: User) => {
			if (user.id === config.clientId) {
				message.react("💧");
			}
		});
	},
};
