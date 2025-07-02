"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        schema: "content",
        tableName: "programs",
      },
      {
        id: {
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        trainer_id: {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              schema: "identity",
              tableName: "users",
            },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        title: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false,
        },
        price: {
          type: Sequelize.DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        file_url: {
          type: Sequelize.DataTypes.STRING,
          unique: true,
        },
        createdAt: {
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.NOW,
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({
      schema: "content",
      tableName: "programs",
    });
  },
};
