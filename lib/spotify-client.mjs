import axios from "axios";

class SpotifyClient {
	constructor() {
		this.url = "https://api.spotify.com/v1/";
	}

	async request(endpoint, params = {}) {
		const p = new URLSearchParams({ params });
		const response = await axios(`${this.url}${endpoint}?${p}`, {});
	}

	getRecentlyPlayed() {}
}
