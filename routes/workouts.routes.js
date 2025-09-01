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
    const { title } = req.body;
    console.log(title);
    const workout = { user_id, title };
    const result = await Workout.create(workout);
    if (!result) {
      return res
        .status(400)
        .json({ message: "something went wrong creating workout" });
    }
    res.status(200).json({ message: "Workout started", workout: result });
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
      return res.status(200).json({
        message: "Workout finished. Keep it up!",
        workout_id,
        duration,
      });
    } else {
      res.status(404).json({ message: "Workout not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Update note (PUT)
router.put("/:id/note", authenticate, async (req, res) => {
  try {
    const workout_id = req.params.id;
    const { note } = req.body;
    const [update] = Workout.update(
      { notes: note },
      { where: { id: workout_id } }
    );
    if (update) {
      return res.status(200).json({ message: "Note added.", note });
    } else {
      res.status(404).json({ message: "Workout not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Edit Workout title (PUT)
router.put("/:id/title", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const [update] = await Workout.update({ title }, { where: { id } });
    if (!update) {
      return res.status(400).json({ message: "Title not updated" });
    }
    res.status(201).json({ message: "Title updated", update: { id, title } });
  } catch (err) {
    res.json(400).message({ error: err.message });
  }
});

//Delete workout (delete)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const isDeleted = await Workout.destroy({ where: { id } });
    if (!isDeleted) {
      return res.status(400).json({ message: "Workout not deleted" });
    }
    res.status(200).json({ message: "Workout deleted", id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
