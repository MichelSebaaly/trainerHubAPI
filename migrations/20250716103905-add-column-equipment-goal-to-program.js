"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      { schema: "content", tableName: "programs" },
      "equipment",
      { type: Sequelize.DataTypes.STRING }
    );
    await queryInterface.addColumn(
      { schema: "content", tableName: "programs" },
      "goal",
      { type: Sequelize.DataTypes.STRING }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      { schema: "content", tableName: "programs" },
      "equipment"
    );
    await queryInterface.removeColumn(
      { schema: "content", tableName: "programs" },
      "goal"
    );
  },
};
