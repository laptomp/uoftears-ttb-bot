import { AttachmentBuilder, Channel, Client, EmbedBuilder, Events, TextChannel } from "discord.js";
import { getCourse } from "../../api";
import { CourseDatabase } from "../../database";
import { CourseEntry } from "../../database/course-database";
import { ChannelWatch, IndividualWatch, WatchDatabase } from "../../database/watch-database";
import { Course, CourseSection } from "../../types";
import { getCourseSectionEmbed, getCourseSectionsEmbed } from "../components/embeds";

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
					individualWatches
						.filter((watch: IndividualWatch) => watch.courseId === course.id)
						.map(async (watch) => {
							const courseSection: CourseSection = course.sections.find(
								(s) => s.name === watch.sectionName,
							)!;
							if (courseSection.currentEnrolment >= courseSection.maxEnrolment)
								return;
							const channel: Channel | null = await client.channels.fetch(
								watch.alertChannelId,
							);

							if (!channel) return;

							if (channel.isSendable()) {
								const embedAlert = getCourseSectionEmbed(course, courseSection);
								try {
									await channel.send({
										content: `<@${watch.userId}> there is an opening in **${watch.sectionName}** of **${course.code}: ${course.name}**`,
										embeds: [embedAlert.setColor("Yellow")],
									});
									await WatchDatabase.removeIndividualWatch(watch.id);
								} catch {}
							}
						}),
				);
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

			setTimeout(watchSweep, 5000);
		};

		watchSweep();
	},
};
