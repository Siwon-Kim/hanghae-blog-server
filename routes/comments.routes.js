const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth-middleware.js");
const CommentController = require("../controllers/comments.controller");
const commentController = new CommentController();

// POST: 댓글 작성 API
router.post("/", authMiddleware, commentController.createComment);

// GET: 댓글 목록 조회 API
router.get("/", commentController.getComments);

// PUT: 댓글 수정 API
router.put("/:_commentId", authMiddleware, commentController.changeComment);

// DELETE: 댓글 삭제 API
router.delete("/:_commentId", authMiddleware, commentController.deleteComment);

module.exports = router;