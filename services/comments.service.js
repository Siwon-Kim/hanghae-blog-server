const CommentRepository = require("../repositories/comments.repository");

class CommentService {
	commentRepository = new CommentRepository();

	createComment = async (postId, nickname, userId, comment) => {
        await this.commentRepository.createComment(postId, nickname, userId, comment);
    }

    findAllComments = async (postId) => {
        const comments = await this.commentRepository.findAllComments(postId);

        return comments.map((comment) => ({
            commentId: comment.commentId,
            userId: comment.UserId,
            nickname: comment.nickname,
            comment: comment.comment,
            createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,
        }))
    }

    findComment = async (commentId) => {
        const comment = await this.commentRepository.findComment(commentId);

        return comment;
    }

    updateComment = async (comment, commentId) => {
        await this.commentRepository.updateComment(comment, commentId);
    }

    deleteComment = async (commentId) => {
        await this.commentRepository.deleteComment(commentId);
    }
}

module.exports = CommentService;