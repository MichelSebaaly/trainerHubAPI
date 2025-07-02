const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const WorkoutExercices = require("./workout-exercices");

const WorkoutSets = sequelize.define(
  "workout_sets",
  {
    exercice_id: {
      type: DataTypes.INTEGER,
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { schema: "content", timestamps: true }
);

WorkoutExercices.hasMany(WorkoutSets, { foreignKey: "exercice_id" });
WorkoutSets.belongsTo(WorkoutExercices, { foreignKey: "exercice_id" });

module.exports = WorkoutSets;
