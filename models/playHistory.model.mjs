import mongoose from "mongoose";

const PlayHistorySchema = new mongoose.Schema({
	track: {
		name: {
			type: String,
			required: true,
		},
		album: {
			album_type: { type: String },
			id: { type: String },
			release_date: { type: Date },
			images: [
				{
					height: { type: Number },
					width: { type: Number },
					url: { type: String },
				},
			],
		},
		artists: [
			{
				name: { type: String },
				id: { type: String },
			},
		],
		duration_ms: {
			type: String,
			required: true,
		},
		popularity: { type: Number },
		id: {
			type: String,
			required: true,
		},
	},
	played_at: {
		type: Date,
		required: true,
	},
	context: {
		type: { type: String },
		href: { type: String },
	},
	user: {
		type: String,
		required: true,
	},
});

const PlayHistory = mongoose.model("PlayHistory", PlayHistorySchema);
export default PlayHistory;
