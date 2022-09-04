import PlayHistory from "../models/playHistory.model.mjs";
import SpotifyClient from "./spotify-client.mjs";

class SpotifyWorker {
	/**
	 * @param {SpotifyClient} client
	 */
	constructor(client) {
		this.client = new SpotifyClient(client);
		this.running = false;
		this.recentlyPlayedInterval = null;
		this.intervalDelay = 360000;
		this.start();
	}

	/**
	 * Loops through the recently played tracks and register them to the database in order to keep track of the for later use. This is done in order to example track the total playtime last month and so on.
	 *
	 * @param {Number} limit how many recently played tracks to check/return (Max 50)
	 */
	async registerRecentlyPlayed(limit = 10) {
		if (!this.running) return;

		const history = await this.client.getRecentlyPlayed(limit);
		const userId = this.client.getId();

		for (const item of history) {
			const trackExists = await PlayHistory.findOne({
				user: userId,
				"track.id": item.track.id,
				played_at: new Date(item.played_at),
			});

			if (trackExists) {
				console.log(
					`[${userId}] ${item.track.name} existed at the time of ${item.played_at}`
				);
				continue;
			}

			const track = await PlayHistory.create({
				...item,
				user: userId,
			});
			await track.save();
			console.log(
				`[${userId}] ${item.track.name} was inserted at the time of ${item.played_at}`
			);
		}
	}

	/**
	 * Start the worker
	 */
	start() {
		if (!this.running) {
			this.running = true;
			this.registerRecentlyPlayed(50);
			this.loop();
		}
	}

	loop() {
		this.recentlyPlayedInterval = setInterval(() => {
			this.registerRecentlyPlayed();
		}, this.intervalDelay);
	}

	/**
	 * Resume the worker
	 */
	resume() {
		if (!this.running) {
			this.running = true;
			this.loop();
		}
	}

	/**
	 * Pause the worker
	 */
	pause() {
		if (this.running) {
			this.running = false;
			clearInterval(this.recentlyPlayedInterval);
		}
	}

	/**
	 * Get the status of the worker
	 *
	 * @returns object containing the status of the worker
	 */
	async status() {
		return {
			running: this.running,
			refresh_token: this.client.getRefreshToken(),
			playtime: await this.client.getPlaytime(),
		};
	}
}

export default SpotifyWorker;
