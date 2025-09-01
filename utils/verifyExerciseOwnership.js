const sequelize = require("../db");

const verifyExerciseOwnership = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const exerciseId = req.params.id;

    const [exercise] = await sequelize.query(
      `
      SELECT w.user_id
      FROM content.workouts w
      JOIN content.workout_exercices e ON w.id = e.workout_id
      WHERE e.id = ?
      `,
      {
        replacements: [exerciseId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    if (exercise.user_id !== user_id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    next();
  } catch (err) {
    console.error("verifyExerciseOwnership error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyExerciseOwnership;
