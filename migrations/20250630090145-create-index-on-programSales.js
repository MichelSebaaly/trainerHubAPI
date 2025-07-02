"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex(
      {
        schema: "billing",
        tableName: "program_sales",
      },
      ["program_id"],
      {
        name: "idx_programsales_program_id",
        using: "BTREE",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      {
        schema: "billing",
        tableName: "program_sales",
      },
      "idx_programsales_program_id"
    );
  },
};
