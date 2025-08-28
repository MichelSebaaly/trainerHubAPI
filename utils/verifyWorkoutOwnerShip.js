const sequelize = require("../db");

const verifyWorkoutOwnership = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const workoutId = req.params.id;
    const userIds = await sequelize.query(
      `
            SELECT user_id
            FROM content.workouts w
            JOIN content.workout_exercices e
            ON w.id = e.workout_id
            WHERE workout_id = ?
            `,
      {
        replacements: [workoutId],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (userIds.length === 0) {
      return res.status(200).json({ message: "Exercise not found" });
    }

    if (userIds[0].user_id !== user_id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  } catch (err) {
    console.error("verifyExerciseOwnership error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyWorkoutOwnership;
