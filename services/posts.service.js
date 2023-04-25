const PostRepository = require("../repositories/posts.repository");

class PostService {
	postRepository = new PostRepository();

	createPost = async (nickname, userId, title, content) => {
		await this.postRepository.createPost(nickname, userId, title, content);
	};

	findAllPost = async () => {
		const allPosts = await this.postRepository.findAllPost();

		return allPosts.map((post) => ({
			postId: post.postId,
			userId: post.UserId,
			nickname: post.nickname,
			title: post.title,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
			likes: post.like,
		}));
	};

	findLikedPosts = async (userId) => {
		const likedPosts = await this.postRepository.findLikedPosts(userId);

		return likedPosts.map((post) => ({
			postId: post.Post.postId,
			userId: post.Post.UserId,
			nickname: post.Post.nickname,
			title: post.Post.title,
			createdAt: post.Post.createdAt,
			updatedAt: post.Post.updatedAt,
			likes: post.Post.like,
		}));
	};

	findPostById = async (postId) => {
		const post = await this.postRepository.findPostById(postId);

		return post === null
			? 0
			: {
				postId: post.postId,
				userId: post.UserId,
				nickname: post.nickname,
				title: post.title,
				content: post.content,
				createdAt: post.createdAt,
				updatedAt: post.updatedAt,
				likes: post.like,
			};
	};

	findPost = async (userId, postId) => {
		const post = await this.postRepository.findPost(userId, postId);

		return post;
	};

	updatePost = async (title, content, postId, userId) => {
		await this.postRepository.updatePost(title, content, postId, userId);
	};

	deletePost = async (postId, userId) => {
		await this.postRepository.deletePost(postId, userId);
	};

	findLike = async (postId, userId) => {
		const getLike = this.postRepository.findLike(postId, userId);

		return getLike;
	};

	createLike = async (userId, postId) => {
		await this.postRepository.createLike(userId, postId);
	};

	deleteLike = async (userId, postId) => {
		await this.postRepository.deleteLike(userId, postId);
	};

	incrementLike = async (postId) => {
		await this.postRepository.incrementLike(postId);
	};

	decrementLike = async (postId) => {
		await this.postRepository.decrementLike(postId);
	};
}

module.exports = PostService;
