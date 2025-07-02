const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const Workout = require("./workouts");

const WorkoutExercices = sequelize.define(
  "workout_exercices",
  {
    workout_id: {
      type: DataTypes.INTEGER,
    },
    exercice_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { schema: "content", timestamps: true }
);

Workout.hasMany(WorkoutExercices, { foreignKey: "workout_id" });
WorkoutExercices.belongsTo(Workout, { foreignKey: "workout_id" });

module.exports = WorkoutExercices;
