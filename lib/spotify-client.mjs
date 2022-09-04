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
}

export default SpotifyClient;
