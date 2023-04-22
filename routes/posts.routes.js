const express = require("express");
const router = express.Router({ mergeParams: true });
const { Posts, Likes } = require("../models");
const { Op } = require("sequelize");
const authMiddleware = require("../middlewares/auth-middleware.js");
const errorHandler = require("../middlewares/errorHandler");

router.get("/like", authMiddleware, async (req, res) => {
    //내가 좋아요 한것만 내보내기.
    const { userId } = res.locals.user;

    try {
        const getLiked = await Likes.findAll({
            where: { userId: userId },
            attributes: ["postId"],
        });

        const postIds = getLiked.map((like) => {
            return like.dataValues.postId;
        });
        const getPosts = await Posts.findAll({
            where: {
                postId: {
                    [Op.in]: postIds,
                },
            },
        });

        if (getPosts.length < 1)
            throw new Error("404/좋아요 게시물이 존재하지 않습니다.");
        return res.status(200).json({ post: getPosts });
    } catch (error) {
        throw new Error(
            error.message || "400/좋아요 게시글 조회에 실패하였습니다."
        );
    }
});
router.post("/:_postId/like", authMiddleware, async (req, res) => {
    const { _postId } = req.params;
    const { userId, nickname } = res.locals.user;

    const getPost = await Posts.findByPk(_postId);
    if (!getPost) throw new Error("404/게시글이 존재하지 않습니다.");

    const getLike = await Likes.findOne({
        where: {
            [Op.and]: [{ PostId: _postId }, [{ userId: userId }]],
        },
    });
    try {
        if (!getLike) {
            await Likes.create({ UserId: userId, PostId: _postId });
            await Posts.increment("like", { where: { postId: _postId } });

            return res
                .status(200)
                .json({ message: "게시글의 좋아요를 등록하였습니다" });
        } else {
            await Likes.destroy({
                where: {
                    [Op.and]: [{ postId: _postId }, [{ userId }]],
                },
            });
            await Posts.decrement("like", { where: { postId: _postId } });

            return res
                .status(200)
                .json({ message: "게시글의 좋아요를 취소하였습니다." });
        }
    } catch (error) {
        throw new Error(error.message || "400/게시글 좋아요에 실패하였습니다.");
    }
});
// POST: 게시글 작성 API
router.post("/", authMiddleware, async (req, res) => {
    const { userId, nickname } = res.locals.user;
    const { title, content } = req.body;

    if (!title || !content)
        throw new Error("412/데이터의 형식이 일치하지 않습니다.");

    if (typeof title !== "string")
        throw new Error("412/게시글 제목의 형식이 일치하지 않습니다.");

    if (typeof content !== "string")
        throw new Error("412/게시글 내용의 형식이 일치하지 않습니다.");

    try {
        await Posts.create({ nickname, title, content, UserId: userId });
        res.status(201).json({ message: "게시글을 작성에 성공하였습니다." });
    } catch (error) {
        throw new Error("400/게시글 작성에 실패하였습니다.");
    }
});

// GET: 전체 게시글 목록 조회 API
router.get("/", async (req, res) => {
    try {
        const posts = await Posts.findAll({
            order: [["createdAt", "DESC"]],
        });
        if (posts.length === 0)
            throw new Error("404/게시글이 존재하지 않습니다.");
        res.status(200).json({ posts });
    } catch (error) {
        throw new Error(error.message || "400/게시글 조회에 실패하였습니다.");
    }
});

// GET: 게시글 조회 API
router.get("/:_postId", async (req, res) => {
    const { _postId } = req.params;

    try {
        const post = await Posts.findByPk(_postId);
        if (!post) throw new Error("404/게시글이 존재하지 않습니다.");
        res.status(200).json({ post });
    } catch (error) {
        throw new Error(error.message || "400/게시글 조회에 실패하였습니다.");
    }
});

// PUT: 게시글 수정 API
router.put("/:_postId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { title, content } = req.body;
    const { _postId } = req.params;

    if (!title || !content)
        throw new Error("412/데이터 형식이 올바르지 않습니다.");

    if (typeof title !== "string")
        throw new Error("412/게시글 제목의 형식이 올바르지 않습니다.");

    if (typeof content !== "string")
        throw new Error("412/게시글 내용의 형식이 올바르지 않습니다.");

    const existingPost = await Posts.findOne({
        where: { UserId: userId, postId: _postId }, // where절 key값 case-insensitive
    });

    if (!existingPost)
        throw new Error("403/게시글 수정의 권한이 존재하지 않습니다.");

    try {
        await Posts.update(
            { title, content },
            { where: { UserId: userId, postId: _postId } }
        )
            .then(res.status(200).json({ message: "게시글을 수정하였습니다." }))
            .catch((error) => {
                throw new Error("401/게시글이 정상적으로 수정되지 않았습니다.");
            });
    } catch (error) {
        throw new Error(error.message || "400/게시글 수정에 실패하였습니다.");
    }
});

// DELETE: 게시글 삭제 API
router.delete("/:_postId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { _postId } = req.params;

    const existingPost = await Posts.findByPk(_postId);
    if (!existingPost) {
        throw new Error("404/게시글이 존재하지 않습니다.");
    }
    if (existingPost.UserId !== userId)
        throw new Error("403/게시글의 삭제 권한이 존재하지 않습니다.");

    try {
        await Posts.destroy({
            where: { UserId: userId, postId: _postId },
        })
            .then(
                res.status(200).json({
                    message: "게시글을 삭제하였습니다.",
                })
            )
            .catch((error) => {
                throw new Error("401/게시글이 정상적으로 삭제되지 않았습니다.");
            });
    } catch (error) {
        throw new Error(error.message || "400/게시글 삭제에 실패하였습니다.");
    }
});

router.use(errorHandler);

module.exports = router;
