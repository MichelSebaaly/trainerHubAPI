"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        schema: "content",
        tableName: "program_ratings",
      },
      {
        user_id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
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
        program_id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              schema: "content",
              tableName: "programs",
            },
            key: "id",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
        },
        rating: {
          type: Sequelize.DataTypes.DECIMAL(2, 1),
          allowNull: false,
        },
        review: {
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
    await queryInterface.addConstraint(
      {
        schema: "content",
        tableName: "program_ratings",
      },
      {
        fields: ["user_id", "program_id"],
        type: "primary key",
        name: "pk_program_ratings",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("program_ratings");
  },
};
