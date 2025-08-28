const express = require("express");
const path = require("path");
const WorkoutExercises = require("../models/workout-exercices");
const authenticate = require("../utils/authenticate");
const checkUser = require("../utils/checkUser");
const Workout = require("../models/workouts");
const verifyWorkoutOwnership = require(path.join(
  __dirname,
  "../utils/verifyWorkoutOwnership"
));

const router = express.Router();

//Get exercices for a workout (GET)
router.get("/:id", authenticate, verifyWorkoutOwnership, async (req, res) => {
  checkUser(req, res, "trainer,user", "You're not allowed to exercise");
  try {
    const workout_id = req.params.id;
    const exercises = await WorkoutExercises.findAll({ where: { workout_id } });
    res.send(exercises);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Add exercice (POST)
router.post("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "You're not allowed to exercise");
  try {
    const workout_id = req.params.id;
    const { exercice_name } = req.body;
    const workout = await Workout.findOne({ where: { id: workout_id } });
    if (!workout) {
      return res.status(404).json({ message: "Please create a workout first" });
    } else {
      const result = await WorkoutExercises.create({
        exercice_name,
        workout_id,
      });
      res
        .status(200)
        .json({ message: "Exercice added to the list", exercise: result });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Edit exercise name (PUT)
router.put("/", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "You're not allowed to exercise");
  try {
    const { exercise_name, id } = req.body;
    const [update] = await WorkoutExercises.update(
      {
        exercice_name: exercise_name,
      },
      { where: { id } }
    );
    if (!update) {
      return res
        .status(400)
        .json({ message: "Failed to update exercise name" });
    }
    res.status(200).json({ message: "Exercise name updated", update });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Remove exercise (delete)
router.delete("/", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "You're not allowed to exercise");
  try {
    const id = req.body;
    const isDeleted = await WorkoutExercises.destroy({ where: { id } });
    if (!isDeleted) {
      return res.status(400).json({ message: "Exercise not deleted" });
    }
    res.status(400).json({ message: "Exercise deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
