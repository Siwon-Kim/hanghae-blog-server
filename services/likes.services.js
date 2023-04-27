const LikeRepository = require("../repository/likes.repository");
const PostRepository = require("../repository/posts.repository");
class LikeService {
    likeRepository = new LikeRepository();
    postRepository = new PostRepository();
    getLikePost = async (userId) => {
        const getLikePost = await this.likeRepository
            .getLikePost(userId)
            .catch((error) => {
                throw new Error("400/게시글 좋아요 찾기에 실패하였습니다.");
            });
        if (getLikePost.length < 1)
            throw new Error("404/아직 좋아요를 누른 게시글이 없습니다.");

        const posts = getLikePost.map((likePosts) => ({
            postId: likePosts.Post.postId,
            userId: likePosts.Post.UserId,
            nickname: likePosts.Post.nickname,
            title: likePosts.Post.title,
            createdAt: likePosts.Post.createdAt,
            updatedAt: likePosts.Post.updatedAt,
            likes: likePosts.Post.like,
        }));

        return posts;
    };

    postLike = async (userId, _postId) => {
        const onePost = await this.postRepository
            .getOnePost(_postId)
            .catch((error) => {
                throw new Error(
                    error.message || "400/게시글 조회에 실패하였습니다."
                );
            });

        if (!onePost) throw new Error("404/게시글이 존재하지 않습니다."); //null

        const postLike = await this.likeRepository
            .postLike(userId, _postId)
            .catch((error) => {
                throw new Error("404/좋아요 게시글 조회 실패.");
            });
        if (!postLike) {
            await this.likeRepository
                .postCreate(userId, _postId)
                .catch((error) => {
                    throw new Error("404/좋아요 게시글 조회 실패.");
                });
            return 1;
        } else {
            await this.likeRepository
                .postDelete(userId, _postId)
                .catch((error) => {
                    throw new Error("404/좋아요 게시글 조회 실패.");
                });
            return 0;
        }
    };
}

module.exports = LikeService;
