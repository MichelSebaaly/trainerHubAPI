"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        schema: "content",
        tableName: "workouts",
      },
      {
        id: {
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              schema: "identity",
              tableName: "users",
            },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        title: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        notes: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        duration: {
          type: "INTERVAL",
          allowNull: false, //change it to true
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
      tableName: "workouts",
    });
  },
};
