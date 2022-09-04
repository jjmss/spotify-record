import PlayHistory from "../models/playHistory.model.mjs";
import spotifyRequest from "./spotify-request.mjs";

class SpotifyClient {
	constructor({ access_token, refresh_token, token_type, client_id }) {
		this.client_id = client_id;
		this.access_token = access_token;
		this.token_type = token_type || "Bearer";
		this.refresh_token = refresh_token;
	}

	/**
	 * Send a get request to the spotify api
	 *
	 * @param {String} endpoint
	 * @param {{}} params
	 * @returns data from spotify's api
	 */
	async get(endpoint, params) {
		return await spotifyRequest.request(endpoint, params, {
			headers: {
				Authorization: `${this.token_type} ${this.access_token}`,
			},
		});
	}

	/**
	 * Get the id of the current client
	 *
	 * @returns the id of the current client
	 */
	getId() {
		return this.client_id;
	}

	/**
	 * Get the current refresh toekn
	 *
	 * @returns the current refresh token
	 */
	getRefreshToken() {
		return this.refresh_token;
	}

	/**
	 * Updates the tokens for the client to work. Usefull when the access token expires and the client needs to be updated.
	 *
	 * @param {{
	 * 	access_token: "",
	 * 	refresh_token: ""
	 * }} tokens
	 */
	updateTokens({ access_token, refresh_token }) {
		this.access_token = access_token;
		this.refresh_token = refresh_token;
	}

	/**
	 * Retrive the latest played tracks for the current user
	 *
	 * @param {number} limit Max 50
	 * @returns array of items recently played
	 * @link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-recently-played
	 */
	async getRecentlyPlayed(limit = 15) {
		const history = await this.get("/me/player/recently-played", {
			limit: limit,
		});

		return history.items;
	}

	/**
	 * Get the current user's profile
	 *
	 * @returns data about the current user
	 * @link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-current-users-profile
	 */
	async user() {
		const user = await this.get("/me");

		return user;
	}

	/**
	 * Get the user's playtime of music. Either for a specific timestamp or total if no parameter is passed.
	 *
	 * @param {{ beforeTimestamp: string, sinceTimestamp: string}} options Specify timestamps for since or before (or both)
	 * @returns object containing data about the user's playtime
	 * @example const playtime = await getPlaytime({sinceTimestamp: "2022-09-04T16:38:10.907Z"});
	 */
	async getPlaytime({ beforeTimestamp, sinceTimestamp } = {}) {
		const query = {
			user: this.client_id,
			played_at: {
				$lte: new Date(beforeTimestamp),
				$gte: new Date(sinceTimestamp),
			},
		};

		// Delete unused filters to prevent query conflicts
		if (!beforeTimestamp && !sinceTimestamp) {
			delete query.played_at;
		} else if (!beforeTimestamp) {
			delete query.played_at.$lte;
		} else if (!sinceTimestamp) {
			delete query.played_at.$gte;
		}

		const playtime = await PlayHistory.aggregate([
			{
				$match: query,
			},
			{
				$group: {
					_id: "$user",
					playtime_ms: {
						$sum: {
							$convert: { input: "$track.duration_ms", to: "int" },
						},
					},
					total_tracks: {
						$count: {},
					},
					latest_track_played_at: {
						$max: "$played_at",
					},
					first_track_played_at: {
						$min: "$played_at",
					},
				},
			},
		]);

		// Return the "only" (last) element in the aggregation array
		return playtime.pop() || {};
	}
}

export default SpotifyClient;
