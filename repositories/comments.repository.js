const { Comments } = require("../models");

class CommentRepository {
	createComment = async (postId, nickname, userId, comment) => {
        await Comments.create({
			PostId: postId,
			nickname,
			UserId: userId,
			comment,
		});
	};

	findAllComments = async (postId) => {
		const comments = await Comments.findAll({
			where: { PostId: postId },
			order: [["createdAt", "DESC"]],
		});
		return comments;
	};

	findComment = async (commentId) => {
		const comment = await Comments.findOne({
			where: { commentId },
		});
		return comment;
	};

	updateComment = async (comment, commentId) => {
		await Comments.update(
			{ comment },
			{
				where: { commentId },
			}
		);
	};

	deleteComment = async (commentId) => {
		await Comments.destroy({
			where: { commentId },
		})
	};
}

module.exports = CommentRepository;
