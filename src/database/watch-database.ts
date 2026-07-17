import { Message, User } from "discord.js";
import { DataTypes, Sequelize } from "sequelize";
import { Course } from "../types";
import { InvalidSectionNameError } from "./errors";

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "src/database/watch-database.ts",
	logging: false,
});

const IndividualWatchTable = sequelize.define("IndividualWatches", {
	id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true,
	},
	courseId: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
	sectionName: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
		validate: {
			isValidSectionName(value: string) {
				if (!/^(LEC|TUT|PRA)\d{1,4}$/.test(value)) {
					throw new InvalidSectionNameError(`Invalid section name: ${value}`);
				}
			},
		},
	},
	userId: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
	alertChannelId: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
});

const ChannelWatchTable = sequelize.define("ChannelWatches", {
	id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true,
	},
	courseId: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
	messageId: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
});

/**
 * Contains methods for easy access to the watch database.
 */
export class WatchDatabase {
	/**
	 * Synchronize all tables in the watch database.
	 *
	 * @param force Whether the tables should be dropped and made anew
	 * @param alter Whether the necessary changes should be made to the current table states
	 */
	static async synchronizeAll(force: boolean = false, alter: boolean = false): Promise<void> {
		await sequelize.sync({ force: force, alter: alter });
	}

	/**
	 * Synchronize the `IndividualWatchTable`.
	 *
	 * @param force Whether the table should be dropped and made anew
	 * @param alter Whether the necessary changes should be made to the current table state
	 */
	static async synchronizeIndividualWatchTable(
		force: boolean = false,
		alter: boolean = false,
	): Promise<void> {
		await IndividualWatchTable.sync({ force: force, alter: alter });
	}

	/**
	 * Synchronize the `ChannelWatchTable`.
	 *
	 * @param force Whether the table should be dropped and made anew
	 * @param alter Whether the necessary changes should be made to the current table state
	 */
	static async synchronizeChannelWatchTable(
		force: boolean = false,
		alter: boolean = false,
	): Promise<void> {
		await ChannelWatchTable.sync({ force: force, alter: alter });
	}

	/**
	 * Add a watch entry to the `IndividualWatchTable`.
	 *
	 * @param course 			The course being watched
	 * @param section			The section of the course being watched
	 * @param user				The user who requested the watch
	 * @param alertChannelId	The channel the alerts will be sent in
	 */
	static async addIndividualWatch(
		course: Course,
		section: string,
		user: User,
		alertChannelId: string,
	): Promise<void> {
		await IndividualWatchTable.create({
			courseId: course.id,
			sectionName: section,
			userId: user.id,
			alertChannelId: alertChannelId,
		});
	}

	/**
	 * Add a watch entry to the `ChannelWatchTable`.
	 *
	 * @param course	The course being watched
	 * @param message	The message containing the course section information
	 */
	static async addChannelWatch(course: Course, message: Message): Promise<void> {
		await ChannelWatchTable.create({
			courseId: course.id,
			messageId: message.id,
		});
	}

	/**
	 * Remove a watch from the `IndividualWatchTable`.
	 *
	 * @param id The ID of the watch being removed
	 */
	static async removeIndividualWatch(id: number): Promise<void> {
		await IndividualWatchTable.destroy({ where: { id: id } });
	}

	/**
	 * Remove a watch from the `ChannelWatchTable`.
	 *
	 * @param id The ID of the watch being removed
	 */
	static async removeChannelWatch(id: number): Promise<void> {
		await ChannelWatchTable.destroy({ where: { id: id } });
	}

	/**
	 * Get all watches in the `IndividualWatchesTable`.
	 *
	 * @returns A promise of an array of objects representing the watches
	 */
	static async getAllIndividualWatches(): Promise<Array<Object>> {
		return (await IndividualWatchTable.findAll()).map((watch) => watch.dataValues);
	}

	/**
	 * Get watches in the `IndividualWatchesTable` for a specific user
	 *
	 * @param user The user being searched for
	 * @returns A promise of an array of objects representing the watches
	 */
	static async getIndividualWatchesByUser(user: User): Promise<Array<Object>> {
		return (await IndividualWatchTable.findAll({ where: { userId: user.id } })).map(
			(watch) => watch.dataValues,
		);
	}

	/**
	 * Get watches in the `IndividualWatchesTable` for a specific course
	 *
	 * @param course The course being searched for
	 * @returns A promise of an array of objects representing the watches
	 */
	static async getIndividualWatchesByCourse(course: Course): Promise<Array<Object>> {
		return (await IndividualWatchTable.findAll({ where: { courseId: course.id } })).map(
			(watch) => watch.dataValues,
		);
	}

	/**
	 * Get all watches in the `ChannelWatchesTable`.
	 *
	 * @returns A promise of an array of objects representing the watches
	 */
	static async getAllChannelWatches(): Promise<Array<Object>> {
		return (await ChannelWatchTable.findAll()).map((watch) => watch.dataValues);
	}

	/**
	 * Get watches in the `ChannelWatchesTable` for a specific course
	 *
	 * @param course The course being searched for
	 * @returns A promise of an array of objects representing the watches
	 */
	static async getChannelWatchesByCourse(course: Course): Promise<Array<Object>> {
		return (await ChannelWatchTable.findAll({ where: { courseId: course.id } })).map(
			(watch) => watch.dataValues,
		);
	}
}
