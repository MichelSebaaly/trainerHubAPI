const express = require("express");
const WorkoutSets = require("../models/workout-sets");
const authenticate = require("../utils/authenticate");
const checkUser = require("../utils/checkUser");
const router = express.Router();

//Get sets for a workout exercice return 10 each request (GET)
router.get("/:id", authenticate, async (req, res) => {
  const exercice_id = req.params.id;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const sets = await WorkoutSets.findAll({
      where: { exercice_id },
      limit,
      offset,
      order: [["id", "ASC"]],
    });
    res.send(sets);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get a single set (GET)
router.get("/set/:id", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "You're not allowed to exercise");
  try {
    const id = req.params.id;
    const set = await WorkoutSets.findByPk(id);
    if (!set) {
      return res.status(400).json({ message: "Set not recorded" });
    } else {
      res.send(set);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Record a set (POST)
router.post("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "You're not allowed to exercise");
  try {
    const exercice_id = req.params.id;
    const { reps, weight, notes } = req.body;
    if (!Number.isInteger(reps) || reps < 1) {
      return res
        .status(400)
        .json({ message: "Reps must be a positive integer" });
    }
    await WorkoutSets.create({ exercice_id, reps, weight, notes });
    res.status(200).json({ message: "recorded a set" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Edit a set (PUT)
router.put("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "You're not allowed to exercise");
  try {
    const id = req.params.id;
    const [update] = await WorkoutSets.update(
      { ...req.body },
      { where: { id } }
    );
    if (!update) {
      return res
        .status(404)
        .json({ message: "Something went wrong updating set" });
    } else {
      res.status(200).json({ message: "set updated" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Remove a set (DELETE)
router.delete("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "trainer,user", "You're not allowed to exercise");
  const setId = req.params.id;
  try {
    const deleted = await WorkoutSets.destroy({ where: { id: setId } });
    if (!deleted) {
      return res.status(400).json({ message: "Set not found" });
    } else {
      res.status(200).json({ message: "Set removed" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
