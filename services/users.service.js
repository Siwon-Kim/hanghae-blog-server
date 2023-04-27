const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const salt = 10;

const { UserRepository, RedisClientRepository } = require("../repositories/users.repository");

class UserService {
	userRepository = new UserRepository();
	redisClientRepository = new RedisClientRepository();
	
	createAccount = async (nickname, password) => {
		const existingUser = await this.userRepository.findUser(nickname);
		if (existingUser) throw new Error("412/중복된 닉네임입니다.");

		const hashedPassword = await bcrypt.hash(password, salt);
		await this.userRepository.createAccount(nickname, hashedPassword);
	};

	login = async (nickname, password) => {
		const existingUser = await this.userRepository.findUser(nickname);
		let validInput = false;
		if (existingUser) {
			const hashedPassword = existingUser.password;
			const matchingPassword = await bcrypt.compare(password, hashedPassword);
			if (matchingPassword) validInput = true;
		}
		if (!validInput) throw new Error("412/닉네임 또는 패스워드를 확인해주세요.");

		const userId = existingUser.userId;
		const accessToken = createAccessToken(userId);
		const refreshToken = createRefreshToken();
		await this.redisClientRepository.setRefreshToken(refreshToken, userId);
		return { accessToken, refreshToken };
	};
}

function createAccessToken(userId) {
	const accessToken = jwt.sign({ userId }, process.env.SECRET_KEY, {
		expiresIn: "2h",
	});
	return accessToken;
}

function createRefreshToken() {
	const refreshToken = jwt.sign({}, process.env.SECRET_KEY, {
		expiresIn: "7d",
	});
	return refreshToken;
}

module.exports = UserService;
