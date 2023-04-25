const { Posts, Likes } = require("../models");
const { Op } = require("sequelize");

class PostRepository {
	findAllPost = async () => {
		const posts = await Posts.findAll({ order: [["createdAt", "DESC"]] });

		return posts;
	};

	createPost = async (nickname, userId, title, content) => {
		await Posts.create({
			nickname,
			UserId: userId,
			title,
			content,
		});
	};

	findLikedPosts = async (userId) => {
		const likedPosts = await Likes.findAll({
			include: [
				{
					model: Posts,
					attributes: [
						"postId",
						"UserId",
						"nickname",
						"title",
						"createdAt",
						"updatedAt",
						"like",
					],
				},
			],
			where: { UserId: userId },
			attributes: [],
			order: [[Posts, "like", "DESC"]],
		});

		return likedPosts;
	};

	findPostById = async (postId) => {
		const post = await Posts.findByPk(postId);
		console.log(post);
		return post;
	};

	findPost = async (userId, postId) => {
		const post = await Posts.findOne({
			where: { UserId: userId, postId },
		});

		return post;
	};

	updatePost = async (title, content, postId, userId) => {
		await Posts.update(
			{ title, content },
			{
				where: {
					[Op.and]: [{ postId }, { UserId: userId }],
				},
			}
		)
	};

	deletePost = async (postId, userId) => {
		await Posts.destroy({
			where: {
				[Op.and]: [{ postId }, { UserId: userId }],
			},
		})
	};

	findLike = async (postId, userId) => {
		const getLike = await Likes.findOne({
			where: {
				[Op.and]: [{ PostId: postId }, [{ userId: userId }]],
			},
		});

		return getLike;
	};

	createLike = async (userId, postId) => {
        await Likes.create({ UserId: userId, PostId: postId });	};

	deleteLike = async (userId, postId) => {
        await Likes.destroy({
            where: {
                [Op.and]: [{ postId }, [{ userId }]],
            },
        });	};

	incrementLike = async (postId) => {
        await Posts.increment("like", { where: { postId } });
	};

	decrementLike = async (postId) => {
        await Posts.decrement("like", { where: { postId } });
	};
}

module.exports = PostRepository;
