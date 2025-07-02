const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./users");
const Program = require("./programs");

const ProgramRatings = sequelize.define(
  "program_ratings",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    program_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
    },
    review: {
      type: DataTypes.TEXT,
    },
  },
  {
    schema: "content",
  }
);

User.belongsToMany(Program, {
  through: { model: ProgramRatings, schema: "content" },
  foreignKey: "user_id",
  otherKey: "program_id",
});
Program.belongsToMany(User, {
  through: {
    model: ProgramRatings,
    schema: "content",
  },
  foreignKey: "program_id",
  otherKey: "user_id",
});

User.hasMany(ProgramRatings, { foreignKey: "user_id" });
ProgramRatings.belongsTo(User, { foreignKey: "user_id" });

Program.hasMany(ProgramRatings, { foreignKey: "program_id" });
ProgramRatings.belongsTo(Program, { foreignKey: "program_id" });

module.exports = ProgramRatings;
