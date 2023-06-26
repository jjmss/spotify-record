import * as dotenv from "dotenv";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
dotenv.config();

const generateIV = () => randomBytes(16);
const generateKey = () => createHash("sha256").update(process.env.TOKEN_SECRET).digest();

/**
 * Encrypt the token
 *
 * @param {String} token
 * @returns
 */
export const encryptToken = (token) => {
	const iv = generateIV();
	const cipher = createCipheriv("aes-256-cbc", generateKey(), iv);
	let encrypted = cipher.update(token, "utf8", "hex");
	encrypted += cipher.final("hex");
	return iv.toString("hex") + encrypted;
};

/**
 * Decode the token
 *
 * @param {String} token
 * @returns
 */
export const decryptToken = (encrypted) => {
	try {
		const iv = Buffer.from(encrypted.slice(0, 32), "hex");
		const encryptedToken = encrypted.slice(32);
		const decipher = createDecipheriv("aes-256-cbc", generateKey(), iv);
		let decryptedToken = decipher.update(encryptedToken, "hex", "utf8");
		decryptedToken += decipher.final("utf8");
		return decryptedToken;
	} catch (err) {
		console.log("Failed to decrypt", err.code);
		if (err.code === "ERR_CRYPTO_INVALID_IV") return encrypted;
		return err.code;
	}
};
