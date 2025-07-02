"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        schema: "content",
        tableName: "workout_sets",
      },
      {
        id: {
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        exercice_id: {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              schema: "content",
              tableName: "workout_exercices",
            },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        reps: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
        },
        weight: {
          type: Sequelize.DataTypes.DECIMAL(5, 2),
          allowNull: true,
        },
        notes: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
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
      tableName: "workout_sets",
    });
  },
};
