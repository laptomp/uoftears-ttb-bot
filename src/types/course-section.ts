export type CourseSection = {
	name: string;
	type: "Lecture" | "Practical" | "Tutorial";
	teachMethod: "LEC" | "PRAC" | "TUT";
	sectionNumber: string;
	meetingTimes: Array<{
		start: {
			day: number;
			millisofday: number;
		};
		end: {
			day: number;
			millisofday: number;
		};
		building: {
			buildingCode: string;
			buildingRoomNumber: string;
			buildingRoomSuffix: string;
			buildingUrl: string;
		};
		sessionCode: string;
		repitition: string;
		repititionTime: string;
	}>;
	instructors: Array<{
		firstName: string;
		lastName: string;
	}>;
	currentEnrolment: number;
	maxEnrolment: number;
	subTitle: string;
	cancelInd: "Y" | "N";
	waitlistInd: "Y" | "N";
	currentWaitlist: number;
	deliveryModes: {
		session: string;
		mode: string;
	};
};
