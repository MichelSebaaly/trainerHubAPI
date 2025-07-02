const express = require("express");
const authenticate = require("../utils/authenticate");
const checkUser = require("../utils/checkUser");
const ProgramRatings = require("../models/program-ratings");
const ProgramSales = require("../models/program-sales");
const { where, fn, col } = require("sequelize");
const router = express.Router();

//Get ratings (GET)
router.get("/", authenticate, async (req, res) => {
  try {
    const programRatingsDetails = await ProgramRatings.findAll();
    if (!programRatingsDetails) {
      return res.status(400).json({ message: "No rating or reviews" });
    }
    res.send(programRatingsDetails);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//rating for user (POST)
router.post("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "user", "only users can rate!");
  try {
    const program_id = req.params.id;
    const user_id = req.user.id;

    const isBuyer = await ProgramSales.findOne({
      where: {
        user_id,
        program_id,
      },
    });

    const existingRating = await ProgramRatings.findOne({
      where: { user_id, program_id },
    });

    if (!isBuyer) {
      return res
        .status(403)
        .json({ message: "Please purchase to be able to rate" });
    } else {
      const { rating, review } = req.body;
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      if (existingRating) {
        const updateRating = await ProgramRatings.update(
          { rating, review },
          {
            where: { user_id, program_id },
          }
        );
        res.status(200).json({ message: "rating updated" });
      } else {
        const result = await ProgramRatings.create({
          user_id,
          program_id,
          rating,
          review,
        });
        res.status(200).json({ message: "Thank you for your rating" });
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Add review (POST)
router.post("/:id/review", authenticate, async (req, res) => {
  checkUser(req, res, "user", "Only users can review programs");
  try {
    const { review } = req.body;
    const program_id = req.params.id;
    const user_id = req.user.id;

    if (!review || review.trim() === "") {
      return res.status(400).json({ message: "review cannot be empty" });
    }

    const isBuyer = await ProgramSales.findOne({
      where: {
        user_id,
        program_id,
      },
    });

    if (!isBuyer) {
      return res
        .status(403)
        .json({ message: "Please purchase to be able to review" });
    }
    const existingRating = await ProgramRatings.findOne({
      where: {
        user_id,
        program_id,
      },
    });
    if (existingRating) {
      await ProgramRatings.update(
        { review },
        { where: { user_id, program_id } }
      );
      res.status(200).json({ message: "Thanks for updating your review" });
    } else {
      await ProgramRatings.create({ user_id, program_id, review });
      res.status(200).json({ message: "Thanks for updating your review" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get avg rating (GET)
router.get("/avg", authenticate, async (req, res) => {
  try {
    const average = await ProgramRatings.findAll({
      attributes: [
        "program_id",
        [fn("ROUND", fn("AVG", col("rating")), 2), "avg_rating"],
        [fn("COUNT", col("rating")), "rating_count"],
      ],
      group: ["program_id"],
    });
    res.send(average);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Remove review (DELETE)
router.delete("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "admin", "Only admin are authorized for this action");
  try {
    const program_id = req.params.id;
    const user_id = req.body.user_id;

    const existingRating = await ProgramRatings.findOne({
      where: {
        user_id,
        program_id,
      },
    });
    if (existingRating.rating) {
      await ProgramRatings.update(
        { review: null },
        {
          where: {
            program_id,
            user_id,
          },
        }
      );
      res.status(200).json({ message: "Review removed" });
    } else {
      await ProgramRatings.destroy({
        where: {
          program_id,
          user_id,
        },
      });
      res.status(200).json({ message: "Deleted rating row" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
