import { ButtonBuilder, ButtonStyle } from "discord.js";

export function getConfirmationButton(
	customId: string = "confirm",
	label: string = "Confirm",
	style: ButtonStyle = ButtonStyle.Success,
): ButtonBuilder {
	return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}

export function getCancelButton(
	customId: string = "cancel",
	label: string = "Cancel",
	style: ButtonStyle = ButtonStyle.Secondary,
): ButtonBuilder {
	return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}
