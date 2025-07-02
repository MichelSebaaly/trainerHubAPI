"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      {
        schema: "billing",
        tableName: "program_sales",
      },
      {
        user_id: {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              schema: "identity",
              tableName: "users",
            },
            key: "id",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          allowNull: false,
        },
        program_id: {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              schema: "content",
              tableName: "programs",
            },
            key: "id",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          allowNull: false,
        },
        platform_fee: {
          type: Sequelize.DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        trainer_earnings: {
          type: Sequelize.DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        payment_status: {
          type: Sequelize.DataTypes.ENUM("UNPAID", "PAID"),
          defaultValue: "UNPAID",
          allowNull: false,
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
        schema: "billing",
        tableName: "program_sales",
      },
      {
        fields: ["user_id", "program_id"],
        type: "primary key",
        name: "pk_program_sales_user_program",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({
      schema: "billing",
      tableName: "program_sales",
    });
  },
};
