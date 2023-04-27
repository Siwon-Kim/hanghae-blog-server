const PostService = require("../services/posts.service");
const LikeService = require("../services/likes.service");
const { postSchema } = require("./joi");

class PostController {
    postService = new PostService();
    likeService = new LikeService();
    getAllPosts = async (req, res) => {
        const getAllPosts = await this.postService.findAllPost();
        return res.status(200).json({ data: getAllPosts });
    };

    createPost = async (req, res) => {
        await postSchema
            .validateAsync(req.body, { abortEarly: false })
            .catch((error) => {
                throw new Error(`412/${error.message}`);
            });
        const { title, content } = req.body;
        const { userId, nickname } = res.locals.user;

        await this.postService.createPost(title, content, userId, nickname);

        return res.status(200).json({
            message: "게시글을 작성에 성공하였습니다.",
        });
    };

    getOnePost = async (req, res, next) => {
        const { _postId } = req.params;

        const getOnePost = await this.postService.getOnePost(_postId);

        return res.status(200).json({ getOnePost });
    };

    updatePost = async (req, res) => {
        await postSchema
            .validateAsync(req.body, { abortEarly: false })
            .catch((error) => {
                throw new Error(`412/${error.message}`);
            });

        const { userId } = res.locals.user;
        const { title, content } = req.body;
        const { _postId } = req.params;
        await this.postService.authorization(userId, _postId);

        await this.postService.updatePost(userId, title, content, _postId);

        return res.status(200).json({ message: "게시글을 수정하셨습니다" });
    };

    deletePost = async (req, res) => {
        const { userId } = res.locals.user;
        const { _postId } = req.params;

        await this.postService.authorization(userId, _postId);

        await this.postService.deletePost(userId, _postId);

        return res.status(200).json({ message: "삭제성공!" });
    };
    getLikePost = async (req, res) => {
        const { userId } = res.locals.user;

        const getLikePost = await this.likeService.getLikePost(userId);

        return res.status(200).json({ data: getLikePost });
    };
    postLike = async (req, res) => {
        const { _postId } = req.params;
        const { userId } = res.locals.user;

        const postLike = await this.likeService.postLike(userId, _postId);
        postLike == 1
            ? res.status(200).json({ message: "추천!" })
            : res.status(200).json({ message: "추천취소!" });
    };
}

module.exports = PostController;
