const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const salt = 12;
const SECRET_KEY = "secretkeyforvoyageblog";
const { Users } = require("../models");

// 1. 회원 가입 API
router.post("/signup", async (req, res) => {
	const { nickname, password, confirmedPassword } = req.body;

	if (typeof nickname !== "string")
		return res
			.status(412)
			.json({ errorMessage: "닉네임의 형식이 일치하지 않습니다." });

	if (password !== confirmedPassword)
		return res
			.status(412)
			.json({ errorMessage: "패스워드가 일치하지 않습니다." });

	if (password.length < 4 || typeof password !== "string")
		return res
			.status(412)
			.json({ errorMessage: "패스워드 형식이 일치하지 않습니다." });

	if (password.includes(nickname.toLowerCase()))
		return res
			.status(412)
			.json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });

	const nickNameRegex = new RegExp("^[a-zA-z0-9]{3,}$", "g");
	if (!nickNameRegex.test(nickname))
		return res
			.status(412)
			.json({ errorMessage: "닉네임의 형식이 일치하지 않습니다." });

	const existUser = await Users.findOne({
		where: { nickname },
	});
	if (existUser)
		return res.status(412).json({ errorMessage: "중복된 닉네임입니다." });

	try {
		const hashedPassword = await bcrypt.hash(password, salt);
		await Users.create({ nickname, password: hashedPassword });
		res.status(201).json({ message: "회원 가입에 성공하였습니다." });
	} catch (error) {
		console.error(error);
		return res
			.status(400)
			.json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
	}
});

// 2. 로그인 API
router.post("/login", async (req, res) => {
	const { nickname, password } = req.body;

	if (typeof nickname !== "string" || typeof password !== "string")
		return res
			.status(412)
			.json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });

	let validInput = false;
	const existUser = await Users.findOne({
		where: { nickname },
	});
	if (existUser) {
		const hashedPassword = existUser.password;
		const matchingPassword = await bcrypt.compare(password, hashedPassword);
		if (matchingPassword) validInput = true;
	}

	if (!validInput)
		return res
			.status(412)
			.json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });

	try {
		const token = jwt.sign({ userId: existUser.userId }, SECRET_KEY);
		res.cookie("Authorization", `Bearer ${token}`);
		return res.status(200).json({ token });
	} catch (error) {
		console.error(error);
		res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
	}
});

module.exports = router;
