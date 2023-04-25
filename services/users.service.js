const UserRepository = require("../repositories/users.repository");

class UserService {
	userRepository = new UserRepository();

	findUser = async (nickname) => {
		const user = await this.userRepository.findUser(nickname);

		return user;
	};

	createAccount = async (nickname, hashedPassword) => {
		await this.userRepository.createAccount(nickname, hashedPassword);
	};
}

module.exports = UserService;
