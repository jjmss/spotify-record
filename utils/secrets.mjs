import { randomInt } from "crypto";

const generateSecret = (length) => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
	const characterCount = characters.length;

	let randomKey = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = randomInt(0, characterCount);
		randomKey += characters[randomIndex];
	}

	return randomKey;
};

console.log({
	JWT_SECRET: generateSecret(128),
	TOKEN_SECRET: generateSecret(128),
	SPOTIFY_SECRET: generateSecret(128),
});
