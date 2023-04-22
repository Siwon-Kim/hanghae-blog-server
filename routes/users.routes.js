const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const salt = 12;
const SECRET_KEY = "secretkeyforvoyageblog";
const { Users } = require("../models");
const errorHandler = require("../middlewares/errorHandler");

// POST: 회원 가입 API
router.post("/signup", async (req, res) => {
	const { nickname, password, confirmedPassword } = req.body;

	try {
		if (typeof nickname !== "string")
			throw new Error("412/닉네임의 형식이 일치하지 않습니다.");

		if (password !== confirmedPassword)
			throw new Error("412/패스워드가 일치하지 않습니다.");

		if (password.length < 4 || typeof password !== "string")
			throw new Error("412/패스워드 형식이 일치하지 않습니다.");

		if (password.includes(nickname.toLowerCase()))
			throw new Error("412/패스워드에 닉네임이 포함되어 있습니다.");

		const nickNameRegex = new RegExp("^[a-zA-z0-9]{3,}$", "g");
		if (!nickNameRegex.test(nickname))
			throw new Error("412/닉네임의 형식이 일치하지 않습니다.");

		const existUser = await Users.findOne({
			where: { nickname },
		});
		if (existUser) throw new Error("412/중복된 닉네임입니다.");

		const hashedPassword = await bcrypt.hash(password, salt);
		await Users.create({ nickname, password: hashedPassword });
		res.status(201).json({ message: "회원 가입에 성공하였습니다." });
	} catch (error) {
		throw new Error(
			error.message || "400/요청한 데이터 형식이 올바르지 않습니다."
		);
	}
});

// POST: 로그인 API
router.post("/login", async (req, res) => {
	const { nickname, password } = req.body;

	try {
		if (typeof nickname !== "string" || typeof password !== "string")
			throw new Error("412/닉네임 또는 패스워드를 확인해주세요.");

		let validInput = false;
		const existUser = await Users.findOne({
			where: { nickname },
		});
		if (existUser) {
			const hashedPassword = existUser.password;
			const matchingPassword = await bcrypt.compare(
				password,
				hashedPassword
			);
			if (matchingPassword) validInput = true;
		}

		if (!validInput)
			throw new Error("412/닉네임 또는 패스워드를 확인해주세요.");

		const token = jwt.sign({ userId: existUser.userId }, SECRET_KEY);
		res.cookie("Authorization", `Bearer ${token}`);
		return res.status(200).json({ token });
	} catch (error) {
		throw new Error(error.message || "400/로그인에 실패하였습니다.");
	}
});

router.use(errorHandler);

module.exports = router;
