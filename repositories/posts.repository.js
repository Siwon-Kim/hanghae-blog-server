const { Posts, Likes } = require("../models");
const { Op } = require("sequelize");
class PostRepository {
    findAllPost = async () => {
        const getAllPosts = await Posts.findAll({
            order: [["createdAt", "DESC"]],
        });

        return getAllPosts;
    };

    createPost = async (title, content, userId, nickname) => {
        const createPost = await Posts.create({
            nickname,
            title,
            content,
            UserId: userId,
        });
        return createPost;
    };

    getOnePost = async (_postId) => {
        const getOnePost = await Posts.findByPk(_postId);

        return getOnePost;
    };

    updatePost = async (userId, title, content, _postId) => {
        const updatePost = await Posts.update(
            { title, content },
            {
                where: {
                    [Op.and]: [{ postId: _postId }, { UserId: userId }],
                },
            }
        );
        return updatePost;
    };
    deletePost = async (userId, _postId) => {
        const deletePost = await Posts.destroy({
            where: {
                [Op.and]: [{ postId: _postId }, { UserId: userId }],
            },
        });
        return deletePost;
    };
}
module.exports = PostRepository;
