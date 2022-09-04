/**
 * Turn a object into a string of parameters
 *
 * @param {{}} params object containing parameters
 * @returns string containing all the params
 */
export const gParams = (params) => {
	return new URLSearchParams(params).toString();
};
