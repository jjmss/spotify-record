import SpotifyClient from "./spotify-client.mjs";

class SpotiftController {
	constructor() {
		this.clients = new Map();
	}

	status() {
		return {
			active_clients: this.clients.size,
		};
	}

	addClient({
		client_id,
		access_token,
		refresh_token,
		expires_in,
		token_type,
	}) {
		const client = new SpotifyClient({
			access_token: access_token,
			refresh_token: refresh_token,
			token_type: token_type,
			client_id: client_id,
		});

		this.clients.set(client_id, client);
	}

	updateClientTokens(client_id, tokens) {
		const client = this.clients.get(client_id);

		client.updateTokens(tokens);
	}
}

export default SpotiftController;
