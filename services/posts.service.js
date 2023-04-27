const PostRepository = require("../repositories/posts.repository");

class PostService {
    postRepository = new PostRepository();

    findAllPost = async () => {
        const allPost = await this.postRepository
            .findAllPost()
            .catch((error) => {
                throw new Error("400/게시글 조회에 실패하셨습니다");
            });

        if (allPost.length < 1)
            //[]
            throw new Error("404/게시글이 존재하지 않습니다");

        return allPost.map((post) => ({
            postId: post.postId,
            userId: post.UserId,
            nickname: post.nickname,
            title: post.title,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            likes: post.like,
        }));
    };

    createPost = async (title, content, userId, nickname) => {
        const createPost = await this.postRepository
            .createPost(title, content, userId, nickname)

            .catch((error) => {
                throw new Error(
                    error.message || "400/게시글 작성에 실패하였습니다."
                );
            });

        return createPost;
    };

    getOnePost = async (_postId) => {
        const onePost = await this.postRepository
            .getOnePost(_postId)
            .catch((error) => {
                throw new Error(
                    error.message || "400/게시글 조회에 실패하였습니다."
                );
            });

        if (!onePost) throw new Error("404/게시글이 존재하지 않습니다."); //null

        return onePost;
    };

    authorization = async (userId, _postId) => {
        const onePost = await this.postRepository.getOnePost(_postId);
        console.log(onePost);
        if (onePost.userId !== userId)
            throw new Error("403/게시글 수정의 권한이 존재하지 않습니다.");
    };

    updatePost = async (userId, title, content, _postId) => {
        const updatePost = await this.postRepository
            .updatePost(userId, title, content, _postId)
            .catch((error) => {
                throw new Error("401/게시글이 정상적으로 수정되지 않았습니다.");
            });

        return updatePost;
    };
    deletePost = async (userId, _postId) => {
        const deletePost = await this.postRepository
            .deletePost(userId, _postId)
            .catch((error) => {
                throw new Error("401/게시글이 정상적으로 삭제되지 않았습니다.");
            });
        return deletePost;
    };
}

module.exports = PostService;
