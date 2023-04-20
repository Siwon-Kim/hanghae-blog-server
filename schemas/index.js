const mongoose = require("mongoose");

const connect = () => {
	mongoose
		.connect("mongodb://localhost:27017/voyage-blog")
		.catch((err) => console.log(err));
};

mongoose.connection.on("error", (err) => {
	console.error("MongoDB Connection Error", err);
});

module.exports = connect;