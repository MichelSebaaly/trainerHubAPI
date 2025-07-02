const express = require("express");
const Workout = require("../models/workouts");
const authenticate = require("../utils/authenticate");
const checkUser = require("../utils/checkUser");
const router = express.Router();

//Get workouts for each user (GET)
router.get("/", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "Admin can't see workouts");
  try {
    const user_id = req.user.id;
    const workouts = await Workout.findAll({ where: { user_id } });
    res.send(workouts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Add workout (POST)
router.post("/", authenticate, async (req, res) => {
  try {
    const user_id = req.user.id;
    const workout = { ...req.body, user_id };
    const result = await Workout.create(workout);
    if (!result) {
      return res
        .status(400)
        .json({ message: "something went wrong creating workout" });
    }
    res.status(200).json({ message: "Workout started" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Add workout duration (put)
router.put("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "Admin can't record workouts");
  try {
    const { duration } = req.body;
    const workout_id = req.params.id;
    const [updated] = await Workout.update(
      { duration },
      { where: { id: workout_id } }
    );
    if (updated) {
      res.status(200).json({ message: "Workout finished. Keep it up!" });
    } else {
      res.status(404).json({ message: "Workout not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
