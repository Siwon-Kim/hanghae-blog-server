const express = require("express");
const router = express.Router();
const postsRouter = require("./posts.routes.js");
const usersRouter = require("./users.routes.js");
const commentsRouter = require("./comments.routes.js");

router.use("/users", [usersRouter]);

router.use("/posts", [postsRouter]);

router.use("/posts/:_postId/comments", [commentsRouter]);

module.exports = router;
