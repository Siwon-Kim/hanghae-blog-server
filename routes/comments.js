const express = require("express");
const router = express.Router({ mergeParams: true });
const Posts = require("../schemas/posts.js");
const Comments = require("../schemas/comments.js");
const Users = require("../schemas/users.js");
const authMiddleware = require("../middlewares/auth-middleware");

// POST: 댓글 작성 API
// - 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 작성 가능
// - 댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// - 댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
router.post("/", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { comment } = req.body;
	const { _postId } = req.params;

	if (_postId.length !== 24)
		return res
			.status(412)
			.json({ errorMessage: "데이터 형식이 올바르지 않습니다." });

	if (!comment || typeof comment !== "string")
		return res.status(412).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});

	try {
		const existingPost = await Posts.findById(_postId).exec();
		if (!existingPost)
			return res.status(404).json({
				errorMessage: "게시글이 존재하지 않습니다.",
			});

		const writer = await Users.findById(userId).exec();
		const nickname = writer.nickname;
		await Comments.create({ postId: _postId, nickname, userId, comment });
		res.status(201).json({ message: "댓글을 작성하였습니다." });
	} catch (error) {
		console.error(error);
		res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." });
	}
});

// GET: 댓글 목록 조회 API
// - 조회하는 게시글에 작성된 모든 댓글을 목록 형식으로 볼 수 있도록 하기
// - 작성 날짜 기준으로 내림차순 정렬하기
router.get("/", async (req, res) => {
	const { _postId } = req.params;

	if (_postId.length !== 24)
		return res
			.status(412)
			.json({ errorMessage: "데이터 형식이 올바르지 않습니다." });

	const existingPost = await Posts.findById(_postId).exec();
	if (!existingPost)
		return res
			.status(404)
			.json({ errorMessage: "게시글이 존재하지 않습니다." });

	try {
		const allComments = await Comments.find({ postId: _postId })
			.sort({
				createdAt: "desc",
			})
			.exec();
		let comments = allComments.map((comment) => ({
			commentId: comment._id,
			userId: comment.userId,
			nickname: comment.nickname,
			comment: comment.comment,
			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,
		}));
		res.status(200).json({ comments });
	} catch (error) {
		res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." });
	}
});

// PUT: 댓글 수정 API
// - 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 수정 가능
// - 댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// - 댓글 내용을 입력하고 댓글 수정 API를 호출한 경우 작성한 댓글을 수정하기
router.put("/:_commentId", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { comment } = req.body;
	const { _postId, _commentId } = req.params;

	if (_postId.length !== 24 || _commentId.length !== 24)
		return res
			.status(412)
			.json({ errorMessage: "데이터 형식이 올바르지 않습니다." });

	if (!comment || typeof comment !== "string") {
		return res.status(412).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
	}

	const existingPost = await Posts.findById(_postId).exec();
	if (!existingPost)
		return res
			.status(404)
			.json({ errorMessage: "게시글이 존재하지 않습니다." });

	try {
		const existingComment = await Comments.findOne({
			_id: _commentId,
			postId: _postId,
		});
		if (!existingComment)
			return res.status(404).json({
				errorMessage: "댓글이 존재하지 않습니다.",
			});

		if (existingComment.userId.toString() !== userId)
			return res.status(403).json({
				errorMessage: "댓글의 수정 권한이 존재하지 않습니다.",
			});

		await Comments.updateOne(
			{ _id: _commentId, postId: _postId },
			{ $set: { comment } }
		).catch((error) => {
			console.error(error);
			res.status(400).json({
				errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다.",
			});
		});
		res.status(200).json({ message: "댓글을 수정하였습니다." });
	} catch (error) {
		console.error(error);
		res.status(400).json({
			errorMessage: "댓글 수정에 실패하였습니다.",
		});
	}
});

// DELETE: 댓글 삭제 API
// - 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 삭제 가능
// - 원하는 댓글을 삭제하기
router.delete("/:_commentId", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { _postId, _commentId } = req.params;

	if (_postId.length !== 24 || _commentId.length !== 24)
		return res
			.status(412)
			.json({ errorMessage: "데이터 형식이 올바르지 않습니다." });

	const existingPost = await Posts.findById(_postId).exec();
	if (!existingPost)
		return res
			.status(404)
			.json({ errorMessage: "게시글이 존재하지 않습니다." });

	try {
		const existingComment = await Comments.findOne({
			_id: _commentId,
			postId: _postId,
		});
		if (!existingComment)
			return res
				.status(404)
				.json({ errorMessage: "댓글이 존재하지 않습니다." });

		if (existingComment.userId.toString() !== userId)
			return res.status(403).json({
				errorMessage: "댓글의 삭제 권한이 존재하지 않습니다.",
			});

		try {
			await Comments.deleteOne({ _id: _commentId, postId: _postId });
			res.status(200).json({ message: "댓글을 삭제하였습니다." });
		} catch (error) {
			console.error(error);
			res.status(400).json({
				errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다.",
			});
		}
	} catch (error) {
		console.error(error);
		res.status(400).json({
			errorMessage: "댓글 삭제에 실패하였습니다.",
		});
	}
});

module.exports = router;
