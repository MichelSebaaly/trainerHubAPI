const sequelize = require("../db");

const verifyExerciseOwnership = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const setId = req.params.id;

    const userIds = await sequelize.query(
      `
      SELECT w.user_id 
      FROM content.workouts w 
      JOIN content.workout_exercices e ON w.id = e.workout_id
      JOIN content.workout_sets s ON e.id = s.exercice_id
      WHERE s.id = ?
      `,
      {
        replacements: [setId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (userIds.length === 0) {
      return res.status(404).json({ message: "Set not found" });
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

module.exports = verifyExerciseOwnership;
