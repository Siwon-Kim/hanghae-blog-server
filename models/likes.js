"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Likes extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.Users, {
				targetKey: "userId",
				foreignKey: "UserId",
			});

			this.belongsTo(models.Posts, {
				targetKey: "postId",
				foreignKey: "PostId",
			});
		}
	}
	Likes.init(
		{
			likeId: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			UserId: {
				allowNull: false,
				type: DataTypes.INTEGER,
			},
			PostId: {
				unique: true,
				allowNull: false,
				type: DataTypes.INTEGER,
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: "Likes",
		}
	);
	return Likes;
};
