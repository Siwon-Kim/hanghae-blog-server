const express = require("express");
const router = express.Router();
const { UserController } = require("../controllers/users.controller");
const userController = new UserController();

// POST: 회원 가입 API
router.post("/signup", userController.signup);

// POST: 로그인 API
router.post("/login", userController.login);

module.exports = router;
