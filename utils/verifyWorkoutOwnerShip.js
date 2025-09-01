const sequelize = require("../db");

const verifyWorkoutOwnership = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const workoutId = req.params.id;

    const [workout] = await sequelize.query(
      `
      SELECT user_id 
      FROM content.workouts
      WHERE id = ?
      `,
      {
        replacements: [workoutId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.user_id !== user_id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    next();
  } catch (err) {
    console.error("verifyWorkoutOwnership error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyWorkoutOwnership;
