module.exports = async (error, req, res, next) => {
	const [status, errorMessage] = error.message.split("/");
	return res.status(status).json({ errorMessage });
};
