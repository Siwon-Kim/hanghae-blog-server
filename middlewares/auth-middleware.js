const jwt = require("jsonwebtoken");
const SECRET_KEY = "secretkeyforvoyageblog";
const { Users } = require("../models");

module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;

  const [authType, authToken] = (Authorization ?? "").split(" ");

  if (authType !== "Bearer" || !authToken)
    // 쿠키가 존재하지 않을 경우
    return res.status(403).json({
      errorMessage: "로그인이 필요한 기능입니다.",
    });

  try {
    const { userId } = jwt.verify(authToken, SECRET_KEY);
    const user = await Users.findByPk(userId);
    res.locals.user = user;

    next();
  } catch (error) {
    console.error;
    return res.status(403).json({
      // 쿠키가 비정상적이거나 만료된 경우
      errorMessage: "전달된 쿠키에서 오류가 발생하였습니다.",
    });
  }
};
