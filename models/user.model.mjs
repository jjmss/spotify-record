import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	user: {
		type: String,
		required: true,
	},
	display_name: String,
	email: String,
	uri: String,
	country: String,
	token_type: String,
	access_token: {
		type: String,
		required: true,
	},
	refresh_token: {
		type: String,
		required: true,
	},
});

const User = mongoose.model("user", UserSchema);

export default User;
