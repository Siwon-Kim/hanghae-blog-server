const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
	nickname: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

UsersSchema.virtual("userId").get(function () {
	return this._id.toHexString();
});

UsersSchema.set("toJSON", {
	virtuals: true,
});

module.exports = mongoose.model("Users", UsersSchema);