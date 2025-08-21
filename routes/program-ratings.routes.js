const express = require("express");
const authenticate = require("../utils/authenticate");
const checkUser = require("../utils/checkUser");
const ProgramRatings = require("../models/program-ratings");
const ProgramSales = require("../models/program-sales");
const { where, fn, col } = require("sequelize");
const Program = require("../models/programs");
const User = require("../models/users");
const sequelize = require("../db");
const router = express.Router();

async function getExistingProgramAndBuyer(user_id, program_id) {
  const isBuyer = await ProgramSales.findOne({
    where: { user_id, program_id },
  });
  return !!isBuyer;
}

//Get ratings and reviews (GET)
router.get("/", async (req, res) => {
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

//add rating and review for user (POST)
router.post("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "user", "only users can review!");
  try {
    const program_id = req.params.id;
    const user_id = req.user.id;

    const isBuyer = await getExistingProgramAndBuyer(user_id, program_id);
    if (!isBuyer) {
      return res
        .status(403)
        .json({ message: "Please purchase to be able to review" });
    } else {
      const { rating, review } = req.body;

      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }

      const result = await ProgramRatings.create({
        user_id,
        program_id,
        rating,
        review,
      });
      const user = await ProgramRatings.findOne({
        where: { user_id },
        include: [{ model: User, attributes: ["name"] }],
      });

      res.status(200).json({
        message: "Thank you for your review",
        result,
        username: user.user.name,
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//update rating and review (PUT)
router.put("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "user", "only users can review!");
  const program_id = req.params.id;
  const user_id = req.user.id;
  const { rating, review } = req.body;
  try {
    const [update] = await ProgramRatings.update(
      { rating, review },
      {
        where: { user_id, program_id },
      }
    );
    if (!update) {
      return res.status(400).json({ message: "Failed to update review" });
    }
    res.status(200).json({ message: "review updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//add rating (POST)
router.post("/:id/rating", authenticate, async (req, res) => {
  const user_id = req.user.id;
  const program_id = req.params.id;
  const { rating } = req.body;

  const isBuyer = await getExistingProgramAndBuyer(program_id, user_id);

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  if (!isBuyer) {
    return res
      .status(403)
      .json({ message: "Please purchase to be able to rate" });
  }
  try {
    await ProgramRatings.create({ user_id, program_id, rating });
    res.status(200).json({ message: "Thanks for your rating" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//update rating (PATCH)
router.patch("/:id/rating", authenticate, async (req, res) => {
  const user_id = req.user.id;
  const program_id = req.params.id;
  const { rating } = req.body;
  try {
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    } else {
      const [update] = await ProgramRatings.update(
        { rating },
        { where: { user_id, program_id } }
      );
      if (!update) {
        return res.status(400).json({ message: "Failed to update raiting" });
      } else {
        res.status(200).json({ message: "Thanks for updating your rating" });
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

    const isBuyer = await getExistingProgramAndBuyer(program_id, user_id);

    if (!isBuyer) {
      return res
        .status(403)
        .json({ message: "Please purchase to be able to review" });
    }
    await ProgramRatings.create({ user_id, program_id, review });
    res.status(200).json({ message: "Thanks for your review" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//update review (PATCH)
router.patch("/:id/review", authenticate, async (req, res) => {
  const user_id = req.user.id;
  const program_id = req.params.id;
  const { review } = req.body;
  try {
    if (!review || review.trim() === "") {
      return res.status(400).json({ message: "review cannot be empty" });
    } else {
      const [update] = await ProgramRatings.update(
        { review },
        { where: { user_id, program_id } }
      );
      if (!update) {
        return res.status(400).json({ message: "Failed to update review" });
      } else {
        res.status(200).json({ message: "Thanks for updating your review" });
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get avg rating (GET)
router.get("/avg", async (req, res) => {
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
      return res.status(204).json({ message: "Review removed" });
    } else {
      await ProgramRatings.destroy({
        where: {
          program_id,
          user_id,
        },
      });
      res.status(204).json({ message: "Deleted rating row" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//get 5 reviews for a program
router.get("/reviews/:id", async (req, res) => {
  try {
    const programReviews = await ProgramRatings.findAll({
      attributes: ["review"],
      where: {
        program_id: req.params.id,
        review: { [require("sequelize").Op.ne]: null },
      },
      include: {
        model: User,
        attributes: ["name"],
      },
      limit: 5,
    });
    res.send(programReviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//get all reviews for a program
router.get("/reviews/:id/all", async (req, res) => {
  try {
    const programReviews = await ProgramRatings.findAll({
      attributes: ["review"],
      where: {
        program_id: req.params.id,
        review: { [require("sequelize").Op.ne]: null },
      },
      include: {
        model: User,
        attributes: ["name"],
      },
    });
    res.send(programReviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//get rating and reviews for a user specific program (GET)
router.get("/:id/userReview", authenticate, async (req, res) => {
  const program_id = req.params.id;
  const user_id = req.user.id;
  try {
    const userReview = await ProgramRatings.findOne({
      where: { user_id, program_id },
    });
    if (!userReview) {
      return res.status(200).json({ hasRated: false, hasReviewed: false });
    }
    const hasRated = !!userReview.rating;
    const hasReviewed = !!userReview.review;

    res.status(200).json({
      hasRated,
      hasReviewed,
      userRating: userReview.rating || null,
      userReview: userReview.review || null,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
