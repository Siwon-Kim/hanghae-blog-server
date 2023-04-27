const CommentService = require("../services/comments.service");
const PostService = require("../services/posts.service");
const { commentSchema } = require("./joi");

class CommentController {
	commentService = new CommentService();
	postService = new PostService();

	// POST: 댓글 작성 API
	createComment = async (req, res, next) => {
		try {
			const { userId, nickname } = res.locals.user;
			const { _postId } = req.params;
			const { comment } = await commentSchema.validateAsync(req.body).catch((error) => {
				throw new Error(`412/${error}`);
			});

			await this.commentService.createComment(_postId, nickname, userId, comment);
			res.status(201).json({ message: "댓글을 작성하였습니다." });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/댓글 작성에 실패하였습니다.");
		}
	};

	// GET: 댓글 목록 조회 API
	getComments = async (req, res, next) => {
		try {
			const { _postId } = req.params;

			const comments = await this.commentService.findAllComments(_postId);
			res.status(200).json({ comments });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/댓글 조회에 실패하였습니다.");
		}
	};

	// PUT: 댓글 수정 API
	changeComment = async (req, res, next) => {
		try {
			const { userId } = res.locals.user;
			const { _postId, _commentId } = req.params;
			const { comment } = await commentSchema.validateAsync(req.body).catch((error) => {
				throw new Error(`412/${error}`);
			});

			await this.commentService.updateComment(_postId, userId, comment, _commentId);
			res.status(200).json({ message: "댓글을 수정하였습니다." });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/댓글 수정에 실패하였습니다.");
		}
	};

	// DELETE: 댓글 삭제 API
	deleteComment = async (req, res, next) => {
		try {
			const { userId } = res.locals.user;
			const { _postId, _commentId } = req.params;

			await this.commentService.deleteComment(_postId, userId, _commentId);

			res.status(200).json({ message: "댓글을 삭제하였습니다." });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/댓글 삭제에 실패하였습니다.");
		}
	};
}

module.exports = CommentController;
