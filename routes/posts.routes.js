const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth-middleware.js");
const PostController = require("../controllers/posts.controller");
const postController = new PostController();

// POST: 게시글 작성 API
router.post("/", authMiddleware, postController.createPost);

// GET: 전체 게시글 목록 조회 API
router.get("/", authMiddleware, postController.getAllPosts);

// GET: 좋아요한 게시글 조회 API
router.get("/like", authMiddleware, postController.getLikedPosts);

// GET: 게시물 상세 조회 API
router.get("/:_postId", postController.getPost);

// PUT: 게시글 수정 API
router.put("/:_postId", authMiddleware, postController.changePost);

// DELETE: 게시글 삭제 API
router.delete("/:_postId", authMiddleware, postController.deletePost);

// POST: 게시글 좋아요 API
router.post("/:_postId/like", authMiddleware, postController.clickLike);

module.exports = router;
