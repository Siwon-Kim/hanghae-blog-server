const express = require("express");
const router = express.Router({ mergeParams: true });
const { Users, Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware.js");

// POST: 게시글 작성 API
router.post("/", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  if (!title || !content)
    return res.status(412).json({
      errorMessage: "데이터 형식이 올바르지 않습니다.",
    });
  if (typeof title !== "string")
    return res.status(412).json({
      errorMessage: "게시글 제목의 형식이 일치하지 않습니다.",
    });
  if (typeof content !== "string")
    return res.status(412).json({
      errorMessage: "게시글 내용의 형식이 일치하지 않습니다.",
    });

  try {
    const existingUser = await Users.findByPk(userId);
    const nickname = existingUser.nickname;
    await Posts.create({ nickname, title, content, UserId: userId });
    res.status(201).json({ message: "게시글을 작성에 성공하였습니다." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

// GET: 전체 게시글 목록 조회 API
router.get("/", async (req, res) => {
  try {
    const allPosts = await Posts.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ posts: allPosts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// GET: 게시글 조회 API
router.get("/:_postId", async (req, res) => {
  const { _postId } = req.params;

  try {
    const targetPost = await Posts.findByPk(_postId);

    res.status(200).json({ post: targetPost });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// PUT: 게시글 수정 API
router.put("/:_postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;
  const { _postId } = req.params;

  if (!title || !content)
    return res
      .status(412)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  if (typeof title !== "string")
    return res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 올바르지 않습니다." });
  if (typeof content !== "string")
    return res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 올바르지 않습니다." });

  try {
    const existingPost = await Posts.findOne({
      where: { UserId: userId, postId: _postId },
    });

    if (!existingPost)
      return res.status(403).json({
        errorMessage: "게시글 수정의 권한이 존재하지 않습니다.",
      });
    await Posts.update(
      { title, content },
      { where: { userId, postId: _postId } }
    ).catch((error) => {
      console.error(error);
      res.status(401).json({
        errorMessage: "게시글이 정상적으로 수정되지 않았습니다.",
      });
    });
    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
});

// DELETE: 게시글 삭제 API
router.delete("/:_postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { _postId } = req.params;

  try {
    const existingPost = await Posts.findByPk(_postId);
    if (existingPost) {
      if (existingPost.UserId !== userId) {
        return res.status(403).json({
          errorMessage: "게시글의 삭제 권한이 존재하지 않습니다.",
        });
      }
      await Posts.destroy({ where: { userId, postId: _postId } }).catch(
        (error) => {
          console.error(error);
          return res.status(401).json({
            errorMessage: "게시글이 정상적으로 삭제되지 않았습니다.",
          });
        }
      );
      res.status(200).json({
        message: "게시글을 삭제하였습니다.",
      });
    } else {
      return res.status(404).json({
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
