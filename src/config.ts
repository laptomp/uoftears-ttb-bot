import dotenv from "dotenv";

dotenv.config({ debug: false, quiet: true });

export = {
	clientId: process.env.CLIENT_ID!,
	developerIds: process.env.DEVELOPER_IDS?.split(",") ?? [],
};
