const express = require("express");
const router = express.Router({ mergeParams: true });
const { Posts, Comments } = require("../models");

const authMiddleware = require("../middlewares/auth-middleware");
const errorHandler = require("../middlewares/errorHandler");

// POST: 댓글 작성 API
router.post("/", authMiddleware, async (req, res) => {
    const { userId, nickname } = res.locals.user;
    const { comment } = req.body;
    const { _postId } = req.params;

    if (!comment || typeof comment !== "string")
        throw new Error("412/데이터 형식이 올바르지 않습니다.");

    const existingPost = await Posts.findByPk(_postId);
    if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

    try {
        await Comments.create({
            PostId: _postId,
            nickname,
            UserId: userId,
            comment,
        });
        res.status(201).json({ message: "댓글을 작성하였습니다." });
    } catch (error) {
        throw new Error("400/댓글 작성에 실패하였습니다.");
    }
});

// GET: 댓글 목록 조회 API
router.get("/", async (req, res) => {
    const { _postId } = req.params;

    const existingPost = await Posts.findByPk(_postId);
    if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

    try {
        const comments = await Comments.findAll({
            where: { PostId: _postId },
            order: [["createdAt", "DESC"]],
        });
        if (comments.length === 0)
            throw new Error("404/댓글이 존재하지 않습니다.");
        res.status(200).json({ comments });
    } catch (error) {
        throw new Error(error.message || "400/댓글 조회에 실패하였습니다.");
    }
});

// PUT: 댓글 수정 API
router.put("/:_commentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { comment } = req.body;
    const { _postId, _commentId } = req.params;

    if (!comment || typeof comment !== "string")
        throw new Error("412/데이터 형식이 올바르지 않습니다.");

    const existingPost = await Posts.findByPk(_postId);
    if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

    const existingComment = await Comments.findOne({
        where: { commentId: _commentId },
    });
    if (!existingComment) throw new Error("404/댓글이 존재하지 않습니다.");

    if (existingComment.UserId !== userId)
        throw new Error("403/댓글의 수정 권한이 존재하지 않습니다.");

    try {
        await Comments.update(
            { comment },
            {
                where: { commentId: _commentId },
            }
        )
            .then(res.status(200).json({ message: "댓글을 수정하였습니다." }))
            .catch((error) => {
                throw new Error(
                    "400/댓글 수정이 정상적으로 처리되지 않았습니다."
                );
            });
    } catch (error) {
        throw new Error(error.message || "400/댓글 수정에 실패하였습니다.");
    }
});

// DELETE: 댓글 삭제 API
router.delete("/:_commentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { _postId, _commentId } = req.params;

    const existingPost = await Posts.findByPk(_postId);
    if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

    const existingComment = await Comments.findOne({
        where: { commentId: _commentId },
    });
    if (!existingComment) throw new Error("404/댓글이 존재하지 않습니다.");

    if (existingComment.UserId !== userId)
        throw new Error("403/댓글의 삭제 권한이 존재하지 않습니다.");

    try {
        await Comments.destroy({
            where: { commentId: _commentId },
        })
            .then(res.status(200).json({ message: "댓글을 삭제하였습니다." }))
            .catch((error) => {
                throw new Error(
                    "400/댓글 삭제가 정상적으로 처리되지 않았습니다."
                );
            });
    } catch (error) {
        throw new Error(error.message || "400/댓글 삭제에 실패하였습니다.");
    }
});

router.use(errorHandler);

module.exports = router;
