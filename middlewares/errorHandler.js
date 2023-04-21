module.exports = async (error, req, res, next) => {
	const [status, errorMessage] = error.message.split("/");
	console.error(error);
	return res.status(status).json({ errorMessage });
};
