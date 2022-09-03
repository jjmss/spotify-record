import * as dotenv from "dotenv";
import express from "express";
import { randomUUID } from "crypto";
import fetch from "node-fetch";
import mongoose from "mongoose";
import SpotiftController from "./lib/spotify-controller.mjs";
dotenv.config();
const app = express();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = "http://localhost:3000/callback";

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const mongodb = mongoose.connection;
mongodb.on("error", (err) => console.error(err));
mongodb.once("open", () => console.log(`Connected to MongoDB 🔥`));

const spotifyController = new SpotiftController();

app.get("/login", (req, res) => {
	const state = randomUUID();
	const scope =
		"user-read-recently-played user-read-currently-playing user-read-playback-state";

	res.redirect(
		"https://accounts.spotify.com/authorize?" +
			new URLSearchParams({
				response_type: "code",
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state,
				show_dialog: true,
			}).toString()
	);
});

app.get("/callback", async (req, res) => {
	const code = req.query.code || null;
	const state = req.query.state || null;

	if (state === null) {
		res.redirect(
			"/#" +
				new URLSearchParams({
					error: "state_mismatch",
				}).toString()
		);
	} else {
		const url =
			"https://accounts.spotify.com/api/token?" +
			new URLSearchParams({
				code: code,
				redirect_uri: redirect_uri,
				grant_type: "authorization_code",
			}).toString();

		const config = {
			method: "post",
			headers: {
				Authorization:
					"Basic " +
					new Buffer.from(client_id + ":" + client_secret).toString(
						"base64"
					),
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};

		const response = await fetch(url, config);
		const data = await response.json();

		spotifyController.addClient({
			access_token: data.access_token,
		});

		res.send({ data });
	}
});

app.get("/refresh_token", async (req, res) => {
	const refresh_token = req.query.refresh_token;

	const url =
		"https://accounts.spotify.com/api/token?" +
		new URLSearchParams({
			refresh_token: refresh_token,
			grant_type: "refresh_token",
		}).toString();

	const config = {
		method: "post",
		headers: {
			Authorization:
				"Basic " +
				new Buffer.from(client_id + ":" + client_secret).toString(
					"base64"
				),
			"Content-Type": "application/x-www-form-urlencoded",
		},
	};

	const response = await fetch(url, config);
	const data = await response.json();

	res.send({ data });
});

app.get("/status", (req, res) => {
	const status = spotifyController.status();

	console.log({ status });
	res.json(status);
});

app.listen({ port: process.env.PORT }, () => {
	console.log(`🚀Running on port ${process.env.PORT}`);
});
