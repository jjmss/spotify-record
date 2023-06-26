import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Checks if the jwt token matched the :id param
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export const authenticateClientId = (req, res, next) => {
	// Allow if the param id is not given
	if (!req.params["id"]) next();

	// Check the cookie
	const cookieToken = req.cookies.__userToken;

	// Try validating the jwt token
	try {
		jwt.verify(cookieToken, process.env.JWT_SECRET);
	} catch (err) {
		return res.json({
			access: "denied",
			description: "Invalid or missing jwt token",
		});
	}

	const decodedToken = jwt.decode(cookieToken);

	if (decodedToken.client_id !== req.params["id"]) {
		return res.json({
			access: "denied",
			description: `Missing permission to view ${req.params["id"]}`,
		});
	}

	next();
};
