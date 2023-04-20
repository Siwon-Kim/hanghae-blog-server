const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const salt = 12;
const SECRET_KEY = "secretkeyforvoyageblog";
const Users = require("../schemas/users.js");

// 1. 회원 가입 API
//     - 닉네임, 비밀번호, 비밀번호 확인을 **request**에서 전달받기
//     - 닉네임은 `최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)`로 구성하기
//     - 비밀번호는 `최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패`로 만들기
//     - 비밀번호 확인은 비밀번호와 정확하게 일치하기
//     - 데이터베이스에 존재하는 닉네임을 입력한 채 회원가입 버튼을 누른 경우 "중복된 닉네임입니다." 라는 에러메세지를 **response**에 포함하기
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

	const existingUser = await Users.find({ nickname }).exec();
	if (existingUser.length)
		return res.status(412).json({ errorMessage: "중복된 닉네임입니다." });

	try {
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = new Users({ nickname, password: hashedPassword });
		await user.save();
		res.status(201).json({ message: "회원 가입에 성공하였습니다." });
	} catch (error) {
		console.error(error);
		return res
			.status(400)
			.json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
	}
});

// 2. 로그인 API
//     - 닉네임, 비밀번호를 **request**에서 전달받기
//     - 로그인 버튼을 누른 경우 닉네임과 비밀번호가 데이터베이스에 등록됐는지 확인한 뒤, 하나라도 맞지 않는 정보가 있다면 "닉네임 또는 패스워드를 확인해주세요."라는 에러 메세지를 **response**에 포함하기
//     - 로그인 성공 시, 로그인에 성공한 유저의 정보를 JWT를 활용하여 클라이언트에게 Cookie로 전달하기
router.post("/login", async (req, res) => {
	const { nickname, password } = req.body;

	if (typeof nickname !== "string" || typeof password !== "string")
		return res
			.status(412)
			.json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });

	let validInput = false
	const existingUser = await Users.findOne({ nickname });
	if(existingUser) {
		const hashedPassword = existingUser.password
		const matchingPassword = await bcrypt.compare(password, hashedPassword)
		if(matchingPassword) validInput = true
	}
	
	if (!validInput)
		return res
			.status(412)
			.json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });

	try {
		const token = jwt.sign({ userId: existingUser.userId }, SECRET_KEY);
		res.cookie("Authorization", `Bearer ${token}`);
		return res.status(200).json({ token });
	} catch (error) {
		console.error(error);
		res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
	}
});

module.exports = router;
