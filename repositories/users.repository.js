const { Users } = require("../models");

class UserRepository {
	findUser = async (nickname) => {
		const user = await Users.findOne({
			where: { nickname },
		});

		return user;
	};

	createAccount = async (nickname, hashedPassword) => {
		await Users.create({ nickname, password: hashedPassword });
	};
}

module.exports = UserRepository;
