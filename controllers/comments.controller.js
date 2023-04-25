const CommentService = require("../services/comments.service");
const PostService = require("../services/posts.service");

class CommentController {
	commentService = new CommentService();
	postService = new PostService();

	// POST: 댓글 작성 API
	createComment = async (req, res, next) => {
		const { userId, nickname } = res.locals.user;
		const { comment } = req.body;
		const { _postId } = req.params;

		if (!comment) throw new Error("412/댓글 내용을 입력해주세요");

		if (typeof comment !== "string")
			throw new Error("412/데이터 형식이 올바르지 않습니다.");

		try {
			const existingPost = await this.postService.findPostById(_postId);
			if (!existingPost)
				throw new Error("404/게시글이 존재하지 않습니다.");

			await this.commentService.createComment(
				_postId,
				nickname,
				userId,
				comment
			);
			res.status(201).json({ message: "댓글을 작성하였습니다." });
		} catch (error) {
			throw new Error(error.message || "400/댓글 작성에 실패하였습니다.");
		}
	};

	// GET: 댓글 목록 조회 API
	getComments = async (req, res, next) => {
		const { _postId } = req.params;

		try {
			const existingPost = await this.postService.findPostById(_postId);
			if (!existingPost)
				throw new Error("404/게시글이 존재하지 않습니다.");

			const comments = await this.commentService.findAllComments(_postId);
			if (comments.length === 0)
				throw new Error("404/댓글이 존재하지 않습니다.");
			res.status(200).json({ comments });
		} catch (error) {
			throw new Error(error.message || "400/댓글 조회에 실패하였습니다.");
		}
	};

	// PUT: 댓글 수정 API
	changeComment = async (req, res, next) => {
		const { userId } = res.locals.user;
		const { comment } = req.body;
		const { _postId, _commentId } = req.params;

		if (!comment) throw new Error("412/댓글 내용을 입력해주세요");

		if (typeof comment !== "string")
			throw new Error("412/데이터 형식이 올바르지 않습니다.");

		try {
			const existingComment = await this.commentService.findComment(
				_commentId
			);
			if (!existingComment)
				throw new Error("404/댓글이 존재하지 않습니다.");
				console.log(existingComment);
			if (existingComment.UserId !== userId)
				throw new Error("403/댓글의 수정 권한이 존재하지 않습니다.");

			await this.commentService
				.updateComment(comment, _commentId)
				.then(
					res.status(200).json({ message: "댓글을 수정하였습니다." })
				)
				.catch((error) => {
					throw new Error(
						"400/댓글 수정이 정상적으로 처리되지 않았습니다."
					);
				});
		} catch (error) {
			throw new Error(error.message || "400/댓글 수정에 실패하였습니다.");
		}
	};

	// DELETE: 댓글 삭제 API
	deleteComment = async (req, res, next) => {
		const { userId } = res.locals.user;
		const { _postId, _commentId } = req.params;

		try {
			const existingPost = await this.postService.findPostById(_postId);
			if (!existingPost)
				throw new Error("404/게시글이 존재하지 않습니다.");

			const existingComment = await this.commentService.findComment(
				_commentId
			);
			if (!existingComment)
				throw new Error("404/댓글이 존재하지 않습니다.");

			if (existingComment.UserId !== userId)
				throw new Error("403/댓글의 삭제 권한이 존재하지 않습니다.");

			await this.commentService
				.deleteComment(_commentId)
				.then(
					res.status(200).json({ message: "댓글을 삭제하였습니다." })
				)
				.catch((error) => {
					throw new Error(
						"400/댓글 삭제가 정상적으로 처리되지 않았습니다."
					);
				});
		} catch (error) {
			throw new Error(error.message || "400/댓글 삭제에 실패하였습니다.");
		}
	};
}

module.exports = CommentController;
