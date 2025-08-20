"use strict";

const { types } = require("pg");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      { schema: "content", tableName: "programs" },
      "cover_photo",
      {
        type: Sequelize.DataTypes.STRING,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      { schema: "content", tableName: "programs" },
      "cover_photo"
    );
  },
};
