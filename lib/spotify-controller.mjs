import spotifyRequest from "./spotify-request.mjs";
import SpotifyWorker from "./spotify-worker.mjs";

class SpotiftController {
	constructor() {
		this.workers = new Map();
	}

	/**
	 * Get the status of the running instance of the application. It wil also return status for a worker if a clientId of a worker is provided
	 *
	 * @param {String} clientId The clienId for a specific worker to get the status of
	 * @returns Object containing status data for the spesific worker with the provided clientId if provided. If the clientId is not provied, it will only return general status data
	 */
	async status(clientId) {
		const status = {};

		if (clientId && this.workers.has(clientId)) {
			const worker = this.workers.get(clientId);
			status.worker = await worker.status();
		}

		return {
			...status,
			active_clients: this.workers.size,
			requests: spotifyRequest.requests(),
		};
	}

	/**
	 * Adds a new worker to the controller. This is done in order to be able to assign jobs to the client/worker
	 * 
	 * @param {{
		client_id: "username",
		access_token: "",
		refresh_token: "",
		expires_in: 3600,
		token_type: "Bearer",
	}} client object containing data about the client
	 */
	addWorker(client) {
		const worker = new SpotifyWorker(client);

		this.workers.set(client.client_id, worker);
	}

	/**
	 * Pause a worker from running
	 *
	 * @param {String} client_id
	 * @returns
	 */
	pauseWorker(client_id) {
		if (!this.workers.has(client_id)) return;

		const worker = this.workers.get(client_id);
		worker.pause();
	}

	/**
	 * Resume a stopped worker
	 *
	 * @param {String} client_id
	 * @returns
	 */
	resumeWorker(client_id) {
		if (!this.workers.has(client_id)) return;

		const worker = this.workers.get(client_id);
		worker.resume();
	}
}

export default SpotiftController;
