import { DataTypes, Sequelize, UniqueConstraintError } from "sequelize";
import { Course } from "../types";
import { isValidCourseCode } from "../utils";
import { CourseAlreadyExistsError, CourseNotFoundError, InvalidCourseCodeError } from "./errors";

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "src/database/course-database.db",
	logging: false,
});

const CourseTable = sequelize.define("Course", {
	id: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		primaryKey: true,
	},
	courseCode: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
		validate: {
			isValidCode(value: string) {
				if (!isValidCourseCode(value)) {
					throw new InvalidCourseCodeError(`Invalid course code: ${value}`);
				}
			},
		},
	},
	courseSectionCode: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
	courseTitle: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
	alerts: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		unique: false,
	},
});

/**
 * Contains methods for easy access to the course database.
 */
export class CourseDatabase {
	/**
	 * Synchronize the `CourseTable` model.
	 *
	 * @param force Whether the `CourseTable` should be dropped if already existing
	 * @param alter Whether the necessary changes should be made to the current table state
	 */
	static async synchronizeTable(force: boolean = false, alter: boolean = false): Promise<void> {
		await CourseTable.sync({ force: force, alter: alter });
	}

	/**
	 * Add a course to the `CourseTable`.
	 *
	 * @param   course    The course being added to the table
	 * @param   alerts    Whether the course should be iterated over to check for alerts
	 * @throws  {CourseAlreadyExistsError} When the course already exists in the table
	 */
	static async addCourse(course: Course, alerts: boolean = false): Promise<void> {
		try {
			await CourseTable.create({
				id: course.id,
				courseCode: course.code,
				courseSectionCode: course.sectionCode,
				courseTitle: course.name,
				alerts: alerts,
			});
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				throw new CourseAlreadyExistsError(course);
			} else {
				console.log(`Something went wrong while adding a course`);
				throw error;
			}
		}
	}

	/**
	 * Removes a course from the `CourseTable`.
	 *
	 * @param course The course being removed from the table
	 * @throws {CourseNotFoundError} When the course could not be found in the table
	 */
	static async removeCourse(course: Course): Promise<void> {
		if (!(await CourseDatabase.isRecorded(course))) {
			throw new CourseNotFoundError(course);
		}

		try {
			await CourseTable.destroy({ where: { id: course.id } });
		} catch (error) {
			console.log(`Something went wrong while destroying a course`);
			throw error;
		}
	}

	static async setAlerts(course: Course, alerting: boolean): Promise<void> {
		if (!(await CourseDatabase.isRecorded(course))) {
			throw new CourseNotFoundError(course);
		}

		try {
			await CourseTable.update({ alerts: alerting }, { where: { id: course.id } });
		} catch (error) {
			console.log(`Something went wrong while setting a course's alerts (${course.id})`);
			throw error;
		}
	}

	/**
	 * Check if a course is in the `CourseTable`.
	 *
	 * @param course The course being checked for
	 * @returns A promise of `true` if the course is present, else a promise of `false`
	 */
	static async isRecorded(course: Course): Promise<boolean> {
		return !!(await CourseTable.findOne({
			where: { id: course.id },
		}));
	}

	/**
	 * Get courses that have `alerts` set to `true`.
	 *
	 * @returns A promise of objects representing courses
	 */
	static async getAlertableCourses(): Promise<Array<Object>> {
		return (await CourseTable.findAll({ where: { alerts: true } })).map(
			(course) => course.dataValues,
		);
	}

	/**
	 * Get all courses recorded in the `CourseTable`.
	 *
	 * @returns A promise of objects representing courses
	 */
	static async getAllCourses(): Promise<Array<Object>> {
		return (await CourseTable.findAll()).map((course) => course.dataValues);
	}
}
