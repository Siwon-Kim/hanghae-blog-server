"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Posts extends Model {
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
			this.hasMany(models.Likes, {
				sourceKey: "postId",
				foreignKey: "PostId",
			});
			this.hasMany(models.Comments, {
				sourceKey: "postId",
				foreignKey: "PostId",
			});
		}
	}
	Posts.init(
		{
			postId: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			UserId: {
				allowNull: false,
				type: DataTypes.INTEGER,
			},
			nickname: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			title: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			content: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			like: {
				allowNull: false,
				type: DataTypes.INTEGER,
				defaultValue: 0,
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
			modelName: "Posts",
		}
	);
	return Posts;
};
