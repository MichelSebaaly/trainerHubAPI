const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const User = require("./users");

const Workout = sequelize.define(
  "workouts",
  {
    user_id: {
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { schema: "content", timestamps: true }
);

User.hasMany(Workout, { foreignKey: "user_id" });
Workout.belongsTo(User, { foreignKey: "user_id" });

module.exports = Workout;
