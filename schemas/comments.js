const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema(
	{
		postId: {
			type: String,
			required: true,
		},
		nickname: {
			type: String,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		comment: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Comments", commentsSchema);
