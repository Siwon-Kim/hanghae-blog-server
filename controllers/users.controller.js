const UserService = require("../services/users.service");
const { signupSchema, loginSchema } = require("./joi");
require("dotenv").config();

class UserController {
	userService = new UserService();

	// POST: 회원 가입 API
	signup = async (req, res, next) => {
		try {
			const { nickname, password } = await signupSchema
				.validateAsync(req.body)
				.catch((error) => {
					throw new Error(`412/${error}`);
				});

			await this.userService.createAccount(nickname, password);
			res.status(201).json({ message: "회원 가입에 성공하였습니다." });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/요청한 데이터 형식이 올바르지 않습니다.");
		}
	};

	// POST: 로그인 API
	login = async (req, res, next) => {
		try {
			const { nickname, password } = await loginSchema
				.validateAsync(req.body)
				.catch((error) => {
					throw new Error(`412/${error}`);
				});

			const { accessToken, refreshToken } = await this.userService.login(
				nickname,
				password
			);
			res.cookie("accessToken", `Bearer ${accessToken}`);
			res.cookie("refreshToken", `Bearer ${refreshToken}`);
			return res.status(200).json({ message: "Token이 정상적으로 발급되었습니다." });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/로그인에 실패하였습니다.");
		}
	};
}

module.exports = { UserController };
