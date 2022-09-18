import PlayHistory from "../models/playHistory.model.mjs";
import spotifyRequest from "./spotify-request.mjs";
import * as dotenv from "dotenv";
import { gParams } from "./utils.mjs";
import fetch from "node-fetch";
import User from "../models/user.model.mjs";
import { encodeToken } from "../utils.mjs";
dotenv.config();

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
		try {
			const data = await spotifyRequest.request(endpoint, params, {
				headers: {
					Authorization: `${this.token_type} ${this.access_token}`,
				},
			});

			if (data.unauthorized) {
				await this.updateTokens();
				return await this.get(endpoint, params);
			}

			return data;
		} catch (error) {
			console.log({ error });
		}
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
	 */
	async updateTokens() {
		const url = `https://accounts.spotify.com/api/token?${gParams({
			refresh_token: this.refresh_token,
			grant_type: "refresh_token",
		})}`;

		const response = await fetch(url, {
			method: "post",
			headers: {
				Authorization: `Basic ${new Buffer.from(
					`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
				).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		const data = await response.json();

		if (data.access_token) {
			this.access_token = data.access_token;
		}

		if (data.refresh_token) {
			this.refresh_token = data.refresh_token;
		}

		// Update the tokens in the database (prevents the user to login after every time the application has downtime)
		await User.findOneAndUpdate(
			{ user: this.client_id },
			{
				access_token: encodeToken(this.access_token),
				refresh_token: encodeToken(this.refresh_token),
			}
		);
	}

	/**
	 * Retrive the latest played tracks for the current user
	 *
	 * @param {number} limit Max 50
	 * @returns array of items recently played
	 * @link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-recently-played
	 */
	async getRecentlyPlayed(limit = 15, before) {
		if (!before) before = new Date().getTime();
		const history = await this.get("/me/player/recently-played", {
			limit: limit,
			before: before,
		});

		return history;
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
