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
	sectionCode: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
	courseTitle: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
});

export type CourseEntry = {
	id: string;
	courseCode: string;
	sectionCode: string;
	courseTitle: string;
};

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
	 * @throws  {CourseAlreadyExistsError} When the course already exists in the table
	 */
	static async addCourse(course: Course): Promise<void> {
		try {
			await CourseTable.create({
				id: course.id,
				courseCode: course.code,
				sectionCode: course.sectionCode,
				courseTitle: course.name,
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
	static async removeCourse(courseId: string): Promise<void> {
		if (!(await CourseDatabase.isRecorded(courseId))) {
			throw new CourseNotFoundError(courseId);
		}

		try {
			await CourseTable.destroy({ where: { id: courseId } });
		} catch (error) {
			console.log(`Something went wrong while destroying a course: ${courseId}`);
			throw error;
		}
	}

	/**
	 * Check if a course is in the `CourseTable`.
	 *
	 * @param courseId The ID of the course being checked for
	 * @returns A promise of `true` if the course is present, else a promise of `false`
	 */
	static async isRecorded(courseId: string): Promise<boolean> {
		return !!(await CourseTable.findOne({
			where: { id: courseId },
		}));
	}

	/**
	 * Get all courses recorded in the `CourseTable`.
	 *
	 * @returns A promise of an array of `CourseEntry` representing the courses
	 */
	static async getAllCourses(): Promise<Array<CourseEntry>> {
		return (await CourseTable.findAll()).map((course) => course.dataValues);
	}

	/**
	 * Get a course by ID from the `CourseTable`.
	 *
	 * @returns A promise of a `CourseEntry` representing the course.
	 */
	static async getCourseById(courseId: string): Promise<CourseEntry> {
		if (!this.isRecorded(courseId)) {
			throw new CourseNotFoundError(courseId);
		}
		return (await CourseTable.findAll({ where: { id: courseId } }))[0].dataValues;
	}
}
