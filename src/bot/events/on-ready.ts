import { AttachmentBuilder, Client, EmbedBuilder, Events } from "discord.js";
import { getCourse } from "../../api";
import { CourseDatabase } from "../../database";
import { CourseEntry } from "../../database/course-database";
import { ChannelWatch, WatchDatabase } from "../../database/watch-database";
import { Course } from "../../types";
import { getCourseSectionsEmbed } from "../components/embeds";

module.exports = {
	name: Events.ClientReady,
	once: true,

	async execute(client: Client) {
		const watchSweep = async () => {
			const channelWatches = await WatchDatabase.getAllChannelWatches();
			const individualWatches = await WatchDatabase.getAllIndividualWatches();

			const uniqueCourses: Array<Course> = await Promise.all(
				[
					...new Set(
						[...channelWatches, ...individualWatches].map((watch) => watch.courseId),
					),
				].map(async (courseId: string) => {
					const entry: CourseEntry = await CourseDatabase.getCourseById(courseId);
					return getCourse(entry.courseCode, ["ARTSC", "SCAR", "ERIN"]);
				}),
			);

			for (const course of uniqueCourses) {
				await Promise.all(
					channelWatches
						.filter((watch: ChannelWatch) => watch.courseId === course.id)
						.map(async (watch) => {
							const channel = client.channels.cache.get(watch.channelId);
							if (channel?.isTextBased()) {
								const replyContent: [EmbedBuilder, AttachmentBuilder] =
									await getCourseSectionsEmbed(course);
								(await channel.messages.fetch(watch.messageId)).edit({
									content: `Last updated <t:${Math.trunc(Date.now() / 1000)}:R>`,
									embeds: [replyContent[0]],
									files: [replyContent[1]],
									components: [],
								});
							}
							if (!channel) return;
						}),
				);
			}

			setTimeout(watchSweep, 30000);
		};

		watchSweep();
	},
};
