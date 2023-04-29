const { Posts, Likes, sequelize } = require("../models");
const { Op } = require("sequelize");
const { Transaction } = require("sequelize");

class LikeRepository {
    getLikePost = async (userId) => {
        const getLikePost = await Likes.findAll({
            include: [
                {
                    model: Posts,
                    attributes: [
                        "postId",
                        "userId",
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
            order: [[Posts, "like", "desc"]],
        });

        return getLikePost;
        //사실 여기서 있기없기 잡아야 서버가 일을 최대한 덜 하는건데 Service까지 가야할까?
    };

    postLike = async (userId, _postId) => {
        const postLike = await Likes.findOne({
            where: {
                [Op.and]: [{ UserId: userId }, [{ PostId: _postId }]],
            },
        });
        return postLike;
    };

    postCreate = async (userId, _postId) => {
        //
        const t = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED, // 트랜잭션 격리 수준을 설정합니다.
        });
        try {
            await Likes.create(
                {
                    UserId: userId,
                    PostId: _postId,
                },
                { transaction: t }
            );

            await Posts.increment(
                { like: +1 },
                { transaction: t, where: { postId: _postId } }
            );
            console.log("in process");
            await t.commit();
        } catch (transactionError) {
            // 에러가 발생하였다면, 트랜잭션을 사용한 모든 쿼리를 Rollback, DB에 반영하지 않습니다.
            console.error(transactionError);
            await t.rollback();
        }
    };
    postDelete = async (userId, _postId) => {
        const t = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED, // 트랜잭션 격리 수준을 설정합니다.
        });
        try {
            await Likes.destroy(
                {
                    where: {
                        [Op.and]: [{ postId: _postId }, [{ userId: userId }]],
                    },
                },
                { transaction: t }
            );
            await Posts.decrement(
                "like",
                {
                    where: {
                        postId: _postId,
                    },
                },
                { transaction: t }
            );
            await t.commit();
        } catch (transactionError) {
            console.error(transactionError);
            await t.rollback();
        }
    };
}
module.exports = LikeRepository;
