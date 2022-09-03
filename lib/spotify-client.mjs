import axios from "axios";

class SpotifyClient {
	constructor({ access_token, refresh_token, token_type, client_id }) {
		this.client_id = client_id;
		this.access_token = access_token;
		this.token_type = token_type || "Bearer";
		this.refresh_token = refresh_token;
		this.url = "https://api.spotify.com/v1/";
	}

	getRefreshToken() {
		return this.refresh_token;
	}

	updateTokens({ access_token, refresh_token }) {
		this.access_token = access_token;
		this.refresh_token = refresh_token;
	}

	async request(endpoint, params = {}) {
		const url = `${this.url}${endpoint}?${new URLSearchParams({ params })}`;
		const response = await axios(`${url}`, {});
		const data = await response.json();

		return data;
	}

	async getRecentlyPlayed() {
		const history = await this.request("v1/me/player/recently-played");
		console.log({ history });
	}
}

export default SpotifyClient;
