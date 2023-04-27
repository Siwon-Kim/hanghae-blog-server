const PostService = require("../services/posts.service");
const { sequelize } = require("../models");
const { Transaction } = require("sequelize");

class PostController {
	postService = new PostService();

	// POST: 게시글 작성 API
	createPost = async (req, res, next) => {
		const { userId, nickname } = res.locals.user;
		const { title, content } = req.body;

		if (!title || !content)
			throw new Error("412/데이터의 형식이 일치하지 않습니다.");

		if (typeof title !== "string")
			throw new Error("412/게시글 제목의 형식이 일치하지 않습니다.");

		if (typeof content !== "string")
			throw new Error("412/게시글 내용의 형식이 일치하지 않습니다.");

		try {
			await this.postService.createPost(nickname, userId, title, content);

			res.status(201).json({
				message: "게시글을 작성에 성공하였습니다.",
			});
		} catch (error) {
			throw new Error(
				error.message || "400/게시글 작성에 실패하였습니다."
			);
		}
	};

	// GET: 전체 게시글 목록 조회 API
	getAllPosts = async (req, res, next) => {
		try {
			const posts = await this.postService.findAllPost();

			if (posts.length === 0)
				throw new Error("404/게시글이 존재하지 않습니다.");

			res.status(200).json({ posts });
		} catch (error) {
			throw new Error(
				error.message || "400/게시글 조회에 실패하였습니다."
			);
		}
	};

	// GET: 좋아요한 게시글 조회 API
	getLikedPosts = async (req, res, next) => {
		const { userId } = res.locals.user;
		try {
			const posts = await this.postService.findLikedPosts(userId);

			if (posts.length === 0) return res.status(200).json({ message: "아직 좋아요를 누른 게시글이 없습니다." });

			res.status(200).json({ posts });
		} catch (error) {
			throw new Error(
				error.message || "400/좋아요 게시글 조회에 실패하였습니다."
			);
		}
	};

	// GET: 게시물 상세 조회 API
	getPost = async (req, res, next) => {
		const { _postId } = req.params;

		try {
			const post = await this.postService.findPostById(_postId);
			if (!post) throw new Error("404/게시글이 존재하지 않습니다.");

			res.status(200).json({ post });
		} catch (error) {
			throw new Error(
				error.message || "400/게시글 조회에 실패하였습니다."
			);
		}
	};

	// PUT: 게시글 수정 API
	changePost = async (req, res, next) => {
		const { userId } = res.locals.user;
		const { title, content } = req.body;
		const { _postId } = req.params;

		if (!title || !content)
			throw new Error("412/데이터 형식이 올바르지 않습니다.");

		if (typeof title !== "string")
			throw new Error("412/게시글 제목의 형식이 올바르지 않습니다.");

		if (typeof content !== "string")
			throw new Error("412/게시글 내용의 형식이 올바르지 않습니다.");

		try {
			const post = await this.postService.findPost(userId, _postId);

			if (!post)
				throw new Error("403/게시글 수정의 권한이 존재하지 않습니다.");

			await this.postService
				.updatePost(title, content, _postId, userId)
				.then(
					res
						.status(200)
						.json({ message: "게시글을 수정하였습니다." })
				)
				.catch((error) => {
					throw new Error(
						"401/게시글이 정상적으로 수정되지 않았습니다."
					);
				});
		} catch (error) {
			throw new Error(
				error.message || "400/게시글 수정에 실패하였습니다."
			);
		}
	};

	// DELETE: 게시글 삭제 API
	deletePost = async (req, res, next) => {
		const { userId } = res.locals.user;
		const { _postId } = req.params;

		try {
			const existingPost = await this.postService.findPostById(_postId);
			if (!existingPost) {
				throw new Error("404/게시글이 존재하지 않습니다.");
			}
			if (existingPost.userId !== userId)
				throw new Error("403/게시글의 삭제 권한이 존재하지 않습니다.");

			await this.postService
				.deletePost(_postId, userId)
				.then(
					res.status(200).json({
						message: "게시글을 삭제하였습니다.",
					})
				)
				.catch((error) => {
					throw new Error(
						"401/게시글이 정상적으로 삭제되지 않았습니다."
					);
				});
		} catch (error) {
			throw new Error(
				error.message || "400/게시글 삭제에 실패하였습니다."
			);
		}
	};

	// POST: 게시글 좋아요 API
	clickLike = async (req, res, next) => {
		const { _postId } = req.params;
		const { userId } = res.locals.user;

		const t = await sequelize.transaction({
			isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
		});

		try {
			const existingPost = await this.postService.findPostById(_postId);
			if (!existingPost)
				throw new Error("404/게시글이 존재하지 않습니다.");

			const existingLike = await this.postService.findLike(
				_postId,
				userId
			);

			if (!existingLike) {
				await this.postService.createLike(userId, _postId, {
					transaction: t,
				});
				await this.postService.incrementLike(_postId, {
					transaction: t,
				});
				await t.commit();
				res.status(200).json({
					message: "게시글의 좋아요를 등록하였습니다",
				});
			} else {
				await this.postService.deleteLike(userId, _postId, {
					transaction: t,
				});
				await this.postService.decrementLike(_postId, {
					transaction: t,
				});
				await t.commit();
				res.status(200).json({
					message: "게시글의 좋아요를 취소하였습니다.",
				});
			}
		} catch (error) {
			await t.rollback();
			throw new Error(
				error.message || "400/게시글 좋아요에 실패하였습니다."
			);
		}
	};
}

module.exports = PostController;
