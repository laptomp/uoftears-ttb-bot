import axios, { AxiosInstance } from "axios";

/**
 * An axios HTTP client made for interacting with the University of Toronto
 * EASI TTB API.
 */
const tearsClient: AxiosInstance = axios.create({
	baseURL: "https://api.easi.utoronto.ca/ttb",
	timeout: 5000,
});

// Setting up exponential backoff for errors
// https://axios.rest/pages/advanced/retry.html
tearsClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (!axios.isAxiosError(error) || !error.config) return Promise.reject(error);

		const config = error.config as any;

		const status = error.response?.status;

		const isRateLimited = status === 429;
		if (isRateLimited) console.log("Rate-limit detected. Retrying request in 1000ms...");

		const shouldRetry =
			isRateLimited ||
			error.code === "ECONNABORTED" ||
			(typeof status === "number" && status >= 500 && status < 600);

		if (!shouldRetry) return Promise.reject(error);

		config._retryCount = config._retryCount ?? 0;

		if (config._retryCount++ === 3) return Promise.reject(error);

		// Exponential backoff
		const backoff = 200 * 2 ** config._retryCount;
		if (!isRateLimited)
			console.log(`Internal server error detected. Retrying request in ${backoff}ms...`);
		await new Promise((resolve) => setTimeout(resolve, backoff));

		return tearsClient(config);
	},
);

export function getClient(): AxiosInstance {
	return tearsClient;
}
