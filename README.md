# University of Toronto Timetable Builder Alert Bot
This bot was a small project created with the purpose of generating alerts for specific course section openings using U of T's Timetable Builder (TTB) REST API. The bot is capable of searching for specific courses and setting up either passively updating messages with course enrolment information or alerts that ping users in their desired channel when an opening is detected.

Unfortunately, due to unforeseen restrictions, course enrolment information is susceptible to significant delays (12+ hours). This is due to U of T's delayed enrolment data refresh from ACORN to TTB (see [issue](https://github.com/laptomp/uoftears-ttb-bot/issues/16)).

This bot will undergo minimal updates due to the large delays and discrepancies between TTB and ACORN.
## Installation
1. The `src` folder must be built to JavaScript.
2. A `.env` or other medium for environment variables must be configured with the following variables: `CLIENT_SECRET`, `TOKEN`, and `CLIENT_ID`. `DEVELOPER_IDS` may be set up with a list of Discord user IDs separated by a single comma and is only used for validating `debugger` command execution.
