import fetch from "node-fetch";
import { gParams } from "./utils.mjs";

/**
 * Class for handling spotify requests
 *
 * @link https://developer.spotify.com/documentation/web-api/reference/#/
 */
class SpotifyRequest {
	constructor() {
		this.urlBase = "https://api.spotify.com/v1";
		this.requestCount = 0;
	}

	/**
	 *
	 * @param {String} endpoint The uri to fetch to
	 * @param {{ limit: 50}} params Params to be passed to the response
	 * @param {{ method: "GET", headers: { Authorization: ""} }} options Options to pass with the request, example the authorization headers
	 * @returns data from the endpoint
	 *
	 * @example // Get the user's top artists
	 * const endpoint = "/me/top/artists";
	 * const params = { limit: 20 };
	 * const options = { headers: { Authorization: "Bearer ..."} }
	 *
	 * const topArtists = await request(endpoint, params, options);
	 */
	async request(endpoint = "", params = {}, options = {}) {
		this.requestCount++;
		const url = `${this.urlBase}${endpoint}?${gParams(params)}`;

		try {
			const response = await fetch(`${url}`, { method: "GET", ...options });
			if (response.status !== 200) {
				if (response.status === 401) {
					return { unauthorized: true };
				}
				throw response;
			}

			const data = await response.json();
			console.log({ requestData: data });
			return data;
		} catch (error) {
			return {
				status: error?.status,
				error: error,
			};
		}
	}

	/**
	 * @returns Amount of requests sent/attempted
	 */
	requests() {
		return this.requestCount;
	}
}

export default new SpotifyRequest();
