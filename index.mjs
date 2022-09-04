import * as dotenv from "dotenv";
import express from "express";
import { randomUUID } from "crypto";
import fetch from "node-fetch";
import mongoose from "mongoose";
import SpotiftController from "./lib/spotify-controller.mjs";
import spotifyRequest from "./lib/spotify-request.mjs";
import { gParams } from "./lib/utils.mjs";
dotenv.config();
const app = express();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = "http://localhost:3000/callback";

// Connect to the mongodb
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const mongodb = mongoose.connection;
mongodb.on("error", (err) => console.error(err));
mongodb.once("open", () => console.log(`Connected to MongoDB 🔥`));

// The controller for all the Spotify workers/clients
const spotifyController = new SpotiftController();

app.get("/login", (req, res) => {
	const state = randomUUID();
	const scope = "user-read-recently-played user-read-currently-playing user-read-playback-state";

	res.redirect(
		`https://accounts.spotify.com/authorize?${gParams({
			response_type: "code",
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state,
		})}`
	);
});

app.get("/callback", async (req, res) => {
	const code = req.query.code || null;
	const state = req.query.state || null;

	if (state === null) {
		res.redirect(`/#${gParams({ error: "state_mismatch" })}`);
	} else {
		const url = `https://accounts.spotify.com/api/token?${gParams({
			code: code,
			redirect_uri: redirect_uri,
			grant_type: "authorization_code",
		})}`;

		const config = {
			method: "post",
			headers: {
				Authorization: `Basic ${new Buffer.from(`${client_id}:${client_secret}`).toString(
					"base64"
				)}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};

		const response = await fetch(url, config);
		const data = await response.json();

		/**
		 * @link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-current-users-profile
		 */
		const user = await spotifyRequest.request(
			"/me",
			{},
			{
				method: "GET",
				headers: {
					Authorization: `${data.token_type} ${data.access_token}`,
				},
			}
		);

		spotifyController.addWorker({
			...data,
			client_id: user.id,
		});

		res.redirect(`/worker/${user.id}`);
	}
});

app.get("/refresh_token", async (req, res) => {
	const refresh_token = req.query.refresh_token;

	const url = `https://accounts.spotify.com/api/token?${gParams({
		refresh_token: refresh_token,
		grant_type: "refresh_token",
	})}`;

	const config = {
		method: "post",
		headers: {
			Authorization: `Basic ${new Buffer.from(`${client_id}:${client_secret}`).toString(
				"base64"
			)}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
	};

	const response = await fetch(url, config);
	const data = await response.json();

	res.send({ data });
});

app.get("/status", (req, res) => {
	const status = spotifyController.status();

	res.json(status);
});

/**
 * Worker controls routes
 */
app.get("/worker/:id", async (req, res) => {
	const workerId = req.params["id"];
	const status = await spotifyController.status(workerId);
	res.json(status);
});
app.get("/worker/:id/pause", async (req, res) => {
	const workerId = req.params["id"];
	spotifyController.pauseWorker(workerId);

	const status = await spotifyController.status(workerId);
	res.json(status);
});
app.get("/worker/:id/resume", async (req, res) => {
	const workerId = req.params["id"];
	spotifyController.resumeWorker(workerId);

	const status = await spotifyController.status(workerId);
	res.json(status);
});

app.listen({ port: process.env.PORT }, () => {
	console.log(`🚀Running on port ${process.env.PORT}`);
});
